from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import date


class UserProfile(models.Model):
    """Profil użytkownika z rolą (kierowca lub pasażer)"""
    ROLE_CHOICES = [
        ('driver', 'Kierowca'),
        ('passenger', 'Pasażer'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    preferred_role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        verbose_name='Rola użytkownika'
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True, verbose_name='Numer telefonu')
    google_id = models.CharField(max_length=255, blank=True, null=True, verbose_name='Identyfikator Google')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Zdjęcie profilowe')
    notifications_enabled = models.BooleanField(default=True, verbose_name='Powiadomienia włączone')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Profil użytkownika'
        verbose_name_plural = 'Profile użytkowników'
    
    def __str__(self):
        return f"{self.user.username} - {self.get_preferred_role_display()}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatycznie tworzy profil przy tworzeniu użytkownika"""
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Zapisuje profil przy aktualizacji użytkownika"""
    if hasattr(instance, 'profile'):
        instance.profile.save()


class Trip(models.Model):
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips_as_driver')
    start_location = models.CharField(max_length=255, verbose_name='Punkt początkowy')
    end_location = models.CharField(max_length=255, verbose_name='Punkt docelowy')
    intermediate_stops = models.JSONField(default=list, blank=True, verbose_name='Punkty pośrednie')
    date = models.DateField(verbose_name='Data')
    time = models.TimeField(verbose_name='Godzina')
    available_seats = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Liczba dostępnych miejsc'
    )
    price_per_seat = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Cena za miejsce (udział w kosztach)'
    )
    completed = models.BooleanField(default=False, verbose_name='Zakończony')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Data zakończenia')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-time']
        verbose_name = 'Przejazd'
        verbose_name_plural = 'Przejazdy'

    def __str__(self):
        return f"{self.start_location} → {self.end_location} ({self.date})"


class Booking(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    seats = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    STATUS_CHOICES = [
        ('reserved', 'Zarezerwowane'),
        ('accepted', 'Zaakceptowane'),
        ('paid', 'Opłacone'),
        ('cancelled', 'Anulowane'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reserved')
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name='Data opłacenia')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('trip', 'passenger')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.passenger} on {self.trip} ({self.status})"


class FavoriteRoute(models.Model):
    """Ulubione trasy użytkownika (pasażera)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_routes')
    start_location = models.CharField(max_length=255, verbose_name='Punkt początkowy')
    end_location = models.CharField(max_length=255, verbose_name='Punkt docelowy')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'start_location', 'end_location')
        ordering = ['-created_at']
        verbose_name = 'Ulubiona trasa'
        verbose_name_plural = 'Ulubione trasy'

    def __str__(self):
        return f"{self.user.username}: {self.start_location} → {self.end_location}"


class TripTemplate(models.Model):
    """Szablon przejazdu dla kierowcy (częsta trasa)"""
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_templates')
    name = models.CharField(max_length=255, verbose_name='Nazwa szablonu', default='Moja trasa')
    start_location = models.CharField(max_length=255, verbose_name='Punkt początkowy')
    end_location = models.CharField(max_length=255, verbose_name='Punkt docelowy')
    intermediate_stops = models.JSONField(default=list, blank=True, verbose_name='Punkty pośrednie')
    time = models.TimeField(verbose_name='Godzina', null=True, blank=True)
    available_seats = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Liczba dostępnych miejsc',
        default=1
    )
    price_per_seat = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Cena za miejsce',
        default=0
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Szablon przejazdu'
        verbose_name_plural = 'Szablony przejazdów'

    def __str__(self):
        return f"{self.driver.username}: {self.name} ({self.start_location} → {self.end_location})"


class Notification(models.Model):
    """Powiadomienia dla użytkowników"""
    NOTIFICATION_TYPES = [
        ('new_trip_on_favorite_route', 'Nowy przejazd na ulubionej trasie'),
        ('booking_request', 'Nowa prośba o rezerwację'),
        ('booking_accepted', 'Rezerwacja zaakceptowana'),
        ('booking_rejected', 'Rezerwacja odrzucona'),
        ('driver_message', 'Wiadomość od kierowcy'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    favorite_route = models.ForeignKey(FavoriteRoute, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, verbose_name='Typ powiadomienia')
    message = models.TextField(verbose_name='Wiadomość')
    read = models.BooleanField(default=False, verbose_name='Przeczytane')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Powiadomienie'
        verbose_name_plural = 'Powiadomienia'
        indexes = [
            models.Index(fields=['user', 'read']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.get_notification_type_display()} ({'Przeczytane' if self.read else 'Nieprzeczytane'})"


@receiver(post_save, sender=Trip)
def create_notifications_for_favorite_routes(sender, instance, created, **kwargs):
    """
    Tworzy powiadomienia dla użytkowników, którzy mają ulubioną trasę pasującą do nowego przejazdu.
    """
    if not created:
        return  # Tylko dla nowych przejazdów
    
    matching_routes = FavoriteRoute.objects.filter(
        start_location__iexact=instance.start_location,
        end_location__iexact=instance.end_location
    )
    
    if instance.date < date.today():
        return
    
    for favorite_route in matching_routes:
        if favorite_route.user != instance.driver:
            profile = favorite_route.user.profile
            if profile.notifications_enabled:
                Notification.objects.create(
                    user=favorite_route.user,
                    trip=instance,
                    favorite_route=favorite_route,
                    notification_type='new_trip_on_favorite_route',
                    message=f"Nowy przejazd na Twojej ulubionej trasie: {instance.start_location} → {instance.end_location} ({instance.date})"
                )


_booking_old_status = {}

@receiver(pre_save, sender=Booking)
def store_old_booking_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Booking.objects.get(pk=instance.pk)
            _booking_old_status[instance.pk] = old_instance.status
        except Booking.DoesNotExist:
            _booking_old_status[instance.pk] = None


@receiver(post_save, sender=Booking)
def create_notifications_for_bookings(sender, instance, created, **kwargs):
    trip = instance.trip
    driver = trip.driver
    passenger = instance.passenger
    
    if created:
        # Sprawdź czy pasażer jest zaufany z auto-akceptacją
        is_auto_accept = TrustedUser.objects.filter(
            user=driver,
            trusted_user=passenger,
            auto_accept=True
        ).exists()

        if is_auto_accept and instance.status == 'reserved':
            instance.status = 'accepted'
            instance.save()
            # Powiadom pasażera o automatycznej akceptacji
            if passenger.profile.notifications_enabled:
                Notification.objects.create(
                    user=passenger,
                    trip=trip,
                    notification_type='booking_accepted',
                    message=f"Twoja rezerwacja w przejeździe {trip.start_location} → {trip.end_location} ({trip.date}) została automatycznie zaakceptowana!"
                )
        else:
            # Normalne powiadomienie dla kierowcy
            driver_profile = driver.profile
            if driver_profile.notifications_enabled:
                Notification.objects.create(
                    user=driver,
                    trip=trip,
                    notification_type='booking_request',
                    message=f"{passenger.username} chce zarezerwować {instance.seats} miejsce/a w przejeździe {trip.start_location} → {trip.end_location}"
                )
    else:
        old_status = _booking_old_status.get(instance.pk)
        if old_status and old_status != instance.status:
            passenger_profile = passenger.profile
            if passenger_profile.notifications_enabled:
                if instance.status == 'accepted':
                    Notification.objects.create(
                        user=passenger,
                        trip=trip,
                        notification_type='booking_accepted',
                        message=f"Twoja rezerwacja w przejeździe {trip.start_location} → {trip.end_location} ({trip.date}) została zaakceptowana!"
                    )
                elif instance.status == 'cancelled' and old_status == 'reserved':
                    Notification.objects.create(
                        user=passenger,
                        trip=trip,
                        notification_type='booking_rejected',
                        message=f"Twoja rezerwacja w przejeździe {trip.start_location} → {trip.end_location} ({trip.date}) została odrzucona."
                    )
        if instance.pk in _booking_old_status:
            del _booking_old_status[instance.pk]


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Saldo'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Portfel'
        verbose_name_plural = 'Portfele'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username}: {self.balance} zł"


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Wpłata'),
        ('payment', 'Płatność za przejazd'),
        ('withdrawal', 'Wypłata'),
        ('refund', 'Zwrot'),
        ('driver_payment', 'Wypłata dla kierowcy'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, verbose_name='Typ transakcji')
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Kwota'
    )
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions', verbose_name='Rezerwacja')
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions', verbose_name='Przejazd')
    description = models.TextField(blank=True, verbose_name='Opis')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Transakcja'
        verbose_name_plural = 'Transakcje'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.get_transaction_type_display()} - {self.amount} zł ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.get_or_create(user=instance)


class Message(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages', verbose_name='Rezerwacja')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', verbose_name='Nadawca')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', verbose_name='Odbiorca')
    message = models.TextField(verbose_name='Treść wiadomości')
    read = models.BooleanField(default=False, verbose_name='Przeczytane')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Wiadomość'
        verbose_name_plural = 'Wiadomości'
        indexes = [
            models.Index(fields=['booking', 'created_at']),
            models.Index(fields=['sender', 'recipient']),
        ]

    def __str__(self):
        return f"{self.sender.username} → {self.recipient.username} ({self.booking.trip})"


class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given', verbose_name='Oceniający')
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received', verbose_name='Oceniany')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='reviews', verbose_name='Przejazd')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='review', null=True, blank=True, verbose_name='Rezerwacja')
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Ocena (1-5)'
    )
    comment = models.TextField(max_length=500, blank=True, verbose_name='Komentarz')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Recenzja'
        verbose_name_plural = 'Recenzje'
        unique_together = ('reviewer', 'trip', 'reviewed_user')
        indexes = [
            models.Index(fields=['reviewed_user', 'created_at']),
            models.Index(fields=['trip', 'reviewer']),
        ]

    def __str__(self):
        return f"{self.reviewer.username} → {self.reviewed_user.username}: {self.rating}/5 ({self.trip})"


class Friendship(models.Model):
    """Znajomość między dwoma użytkownikami"""
    STATUS_CHOICES = [
        ('pending', 'Oczekujące'),
        ('accepted', 'Zaakceptowane'),
        ('rejected', 'Odrzucone'),
        ('blocked', 'Zablokowane'),
    ]

    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_requests_sent', verbose_name='Wysyłający zaproszenie')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_requests_received', verbose_name='Otrzymujący zaproszenie')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Status')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Znajomość'
        verbose_name_plural = 'Znajomości'
        ordering = ['-created_at']
        unique_together = ('requester', 'receiver')
        indexes = [
            models.Index(fields=['requester', 'status']),
            models.Index(fields=['receiver', 'status']),
        ]

    def __str__(self):
        return f"{self.requester.username} → {self.receiver.username}: {self.get_status_display()}"


class TrustedUser(models.Model):
    """Użytkownicy oznaczeni jako zaufani po pozytywnym przejeździe"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trusted_by', verbose_name='Użytkownik, który dodał do zaufanych')
    trusted_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trusted_user_of', verbose_name='Zaufany użytkownik')
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='trusted_marks', verbose_name='Przejazd')
    note = models.TextField(blank=True, verbose_name='Notatka')
    auto_accept = models.BooleanField(default=False, verbose_name='Automatyczna akceptacja rezerwacji')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Zaufany użytkownik'
        verbose_name_plural = 'Zaufani użytkownicy'
        ordering = ['-created_at']
        unique_together = ('user', 'trusted_user')
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} → zaufany: {self.trusted_user.username}"


class Report(models.Model):
    """Zgłoszenia niewłaściwego zachowania użytkowników"""
    REASON_CHOICES = [
        ('inappropriate_behavior', 'Niewłaściwe zachowanie'),
        ('harassment', 'Nękanie'),
        ('no_show', 'Nie pojawienie się'),
        ('dangerous_driving', 'Niebezpieczna jazda'),
        ('fraud', 'Oszustwo'),
        ('other', 'Inne'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Oczekujące'),
        ('under_review', 'W trakcie weryfikacji'),
        ('resolved', 'Rozwiązane'),
        ('dismissed', 'Odrzucone'),
    ]

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made', verbose_name='Zgłaszający')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received', verbose_name='Zgłaszany użytkownik')
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports', verbose_name='Przejazd')
    reason = models.CharField(max_length=50, choices=REASON_CHOICES, verbose_name='Powód')
    description = models.TextField(verbose_name='Opis')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Status')
    admin_notes = models.TextField(blank=True, verbose_name='Notatki administratora')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name='Data rozwiązania')

    class Meta:
        verbose_name = 'Zgłoszenie'
        verbose_name_plural = 'Zgłoszenia'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['reported_user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.reporter.username} zgłasza {self.reported_user.username}: {self.get_reason_display()} ({self.get_status_display()})"


class RecurringTrip(models.Model):
    """Cykliczne przejazdy - szablon do automatycznego generowania przejazdów"""
    FREQUENCY_CHOICES = [
        ('daily', 'Codziennie'),
        ('weekly', 'Co tydzień'),
        ('biweekly', 'Co dwa tygodnie'),
        ('monthly', 'Co miesiąc'),
    ]

    WEEKDAY_CHOICES = [
        (0, 'Poniedziałek'),
        (1, 'Wtorek'),
        (2, 'Środa'),
        (3, 'Czwartek'),
        (4, 'Piątek'),
        (5, 'Sobota'),
        (6, 'Niedziela'),
    ]

    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_trips')
    start_location = models.CharField(max_length=255, verbose_name='Punkt początkowy')
    end_location = models.CharField(max_length=255, verbose_name='Punkt docelowy')
    intermediate_stops = models.JSONField(default=list, blank=True, verbose_name='Punkty pośrednie')
    time = models.TimeField(verbose_name='Godzina')
    available_seats = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Liczba dostępnych miejsc'
    )
    price_per_seat = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Cena za miejsce'
    )

    # Ustawienia cykliczności
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, verbose_name='Częstotliwość')
    weekdays = models.JSONField(default=list, blank=True, verbose_name='Dni tygodnia (dla weekly)')
    start_date = models.DateField(verbose_name='Data rozpoczęcia')
    end_date = models.DateField(null=True, blank=True, verbose_name='Data zakończenia (opcjonalnie)')

    # Zarządzanie
    active = models.BooleanField(default=True, verbose_name='Aktywny')
    last_generated = models.DateField(null=True, blank=True, verbose_name='Ostatnia generacja')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cykliczny przejazd'
        verbose_name_plural = 'Cykliczne przejazdy'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['driver', 'active']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.driver.username}: {self.start_location} → {self.end_location} ({self.get_frequency_display()})"


class Waitlist(models.Model):
    """Lista oczekujących na przejazd"""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='waitlist')
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name='waitlist_entries')
    seats_requested = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    notified = models.BooleanField(default=False, verbose_name='Powiadomiony')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Lista oczekujących'
        verbose_name_plural = 'Listy oczekujących'
        unique_together = ('trip', 'passenger')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['trip', 'notified']),
        ]

    def __str__(self):
        return f"{self.passenger.username} czeka na {self.trip}"


@receiver(post_save, sender=Booking)
def notify_waitlist_on_cancellation(sender, instance, **kwargs):
    """Powiadamia osoby z listy oczekujących gdy rezerwacja zostanie anulowana"""
    if instance.status == 'cancelled':
        trip = instance.trip
        # Sprawdź czy są wolne miejsca
        occupied_seats = Booking.objects.filter(
            trip=trip,
            status__in=['reserved', 'accepted', 'paid']
        ).exclude(id=instance.id).aggregate(
            total=models.Sum('seats')
        )['total'] or 0

        available = trip.available_seats - occupied_seats

        if available > 0:
            # Powiadom osoby z listy oczekujących
            waitlist_entries = Waitlist.objects.filter(
                trip=trip,
                notified=False,
                seats_requested__lte=available
            ).order_by('created_at')

            for entry in waitlist_entries[:3]:  # Powiadom pierwsze 3 osoby
                if entry.passenger.profile.notifications_enabled:
                    Notification.objects.create(
                        user=entry.passenger,
                        trip=trip,
                        notification_type='booking_accepted',  # Używamy istniejącego typu
                        message=f"Zwolniło się miejsce w przejeździe {trip.start_location} → {trip.end_location} ({trip.date})! Zarezerwuj teraz."
                    )
                    entry.notified = True
                    entry.save()
