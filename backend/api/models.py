from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
        verbose_name = 'Przejazd'
        verbose_name_plural = 'Przejazdy'
    
    def __str__(self):
        return f"{self.start_location} → {self.end_location} ({self.date})"
