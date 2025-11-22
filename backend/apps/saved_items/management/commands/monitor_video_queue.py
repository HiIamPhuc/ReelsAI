"""
Django management command to monitor the video processing queue.
Shows queue statistics and health status.
"""

import pika
import requests
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    """Management command to monitor video processing queue status"""
    
    help = "Monitor the video processing queue and show statistics"
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--queue-name',
            type=str,
            default='video_processing',
            help='Name of the RabbitMQ queue (default: video_processing)'
        )
        parser.add_argument(
            '--rabbitmq-host',
            type=str,
            default='localhost',
            help='RabbitMQ host (default: localhost)'
        )
        parser.add_argument(
            '--check-services',
            action='store_true',
            help='Also check the health of external services'
        )
    
    def handle(self, *args, **options):
        """Monitor queue and service status"""
        
        queue_name = options['queue_name']
        rabbitmq_host = options['rabbitmq_host']
        check_services = options['check_services']
        
        self.stdout.write("🔍 Video Processing Queue Monitor")
        self.stdout.write("=" * 50)
        
        # Check RabbitMQ queue
        self._check_queue_status(rabbitmq_host, queue_name)
        
        if check_services:
            self.stdout.write("\\n🌐 External Services Health Check")
            self.stdout.write("=" * 50)
            self._check_service_health()
        
        self.stdout.write("\\n📊 Monitor completed")
    
    def _check_queue_status(self, host: str, queue_name: str):
        """Check RabbitMQ queue status"""
        try:
            self.stdout.write(f"🐇 Checking RabbitMQ queue '{queue_name}' on {host}")
            
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=host)
            )
            channel = connection.channel()
            
            # Declare queue to ensure it exists
            method = channel.queue_declare(queue=queue_name, durable=True, passive=True)
            
            message_count = method.method.message_count
            consumer_count = method.method.consumer_count
            
            self.stdout.write(f"📋 Queue: {queue_name}")
            self.stdout.write(f"📨 Messages waiting: {message_count}")
            self.stdout.write(f"👥 Active consumers: {consumer_count}")
            
            if consumer_count == 0 and message_count > 0:
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠️  Warning: {message_count} messages waiting but no consumers active!"
                    )
                )
            elif consumer_count > 0:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Queue is active with {consumer_count} consumer(s)")
                )
            else:
                self.stdout.write("ℹ️  Queue is empty and ready for jobs")
            
            connection.close()
            
        except pika.exceptions.AMQPConnectionError as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Cannot connect to RabbitMQ: {e}")
            )
        except pika.exceptions.ChannelClosedByBroker as e:
            if "NOT_FOUND" in str(e):
                self.stdout.write(
                    self.style.WARNING(f"⚠️  Queue '{queue_name}' does not exist yet")
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f"❌ Queue error: {e}")
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error checking queue: {e}")
            )
    
    def _check_service_health(self):
        """Check external service health"""
        
        # Check if SERVICE_API_URLS is configured
        if not hasattr(settings, 'SERVICE_API_URLS') or not settings.SERVICE_API_URLS:
            self.stdout.write(
                self.style.ERROR("❌ SERVICE_API_URLS not configured in settings")
            )
            return
        
        services = settings.SERVICE_API_URLS
        
        # Check Video Understanding Service
        video_url = services.get('VIDEO_UNDERSTANDING_API_URL')
        if video_url:
            self._ping_service("Video Understanding API", video_url)
        else:
            self.stdout.write(
                self.style.WARNING("⚠️  VIDEO_UNDERSTANDING_API_URL not configured")
            )
        
        # Check RAG Service
        rag_url = services.get('RAG_API_URL')
        if rag_url:
            self._ping_service("RAG API", rag_url)
        else:
            self.stdout.write(
                self.style.WARNING("⚠️  RAG_API_URL not configured")
            )
        
        # Check Supabase connection
        self._check_supabase()
    
    def _ping_service(self, service_name: str, url: str):
        """Ping a service to check if it's responding"""
        try:
            self.stdout.write(f"🔍 Checking {service_name}: {url}")
            
            # Try a simple GET request with short timeout
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ {service_name} is responding (200 OK)")
                )
            elif response.status_code == 404:
                self.stdout.write(
                    self.style.WARNING(f"⚠️  {service_name} endpoint not found (404)")
                )
            elif response.status_code == 405:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ {service_name} is up (405 Method Not Allowed - expected)")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"⚠️  {service_name} responded with status {response.status_code}")
                )
                
        except requests.exceptions.ConnectTimeout:
            self.stdout.write(
                self.style.ERROR(f"❌ {service_name} connection timeout")
            )
        except requests.exceptions.ConnectionError:
            self.stdout.write(
                self.style.ERROR(f"❌ {service_name} connection failed - service may be down")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error checking {service_name}: {e}")
            )
    
    def _check_supabase(self):
        """Check Supabase connection"""
        try:
            if not hasattr(settings, 'SUPABASE_URL') or not settings.SUPABASE_URL:
                self.stdout.write(
                    self.style.WARNING("⚠️  SUPABASE_URL not configured")
                )
                return
            
            if not hasattr(settings, 'SUPABASE_KEY') or not settings.SUPABASE_KEY:
                self.stdout.write(
                    self.style.WARNING("⚠️  SUPABASE_KEY not configured")
                )
                return
            
            self.stdout.write(f"🔍 Checking Supabase: {settings.SUPABASE_URL}")
            
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Try a simple query to test connection
            # This will raise an exception if credentials are wrong
            response = supabase.table("content_crawling").select("id").limit(1).execute()
            
            if response:
                self.stdout.write(
                    self.style.SUCCESS("✅ Supabase connection successful")
                )
            else:
                self.stdout.write(
                    self.style.WARNING("⚠️  Supabase connection established but no data returned")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Supabase connection failed: {e}")
            )