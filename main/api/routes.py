from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from ninja import Router, UploadedFile
from pydantic import Json

from main.api.schemas import (
    ChangeUserDataSchema,
    ChangedUserDataSuccess,
    ReturnedTripOption,
)
from main.models import Notification, Trip

router = Router(tags=["main"])


@router.get("get_trips", response={200: list})
def get_trips(request, option: ReturnedTripOption = ReturnedTripOption.ALL):
    """
    Получает список поездок в зависимости от выбранной опции.

    Args:
        request: Объект запроса Django.
        option (ReturnedTripOption): Опция фильтрации поездок. По умолчанию ReturnedTripOption.ALL.

    Returns:
        list: Список поездок, соответствующих выбранной опции.

    Raises:
        ValueError: Если передана неверная опция для фильтрации поездок.
    """
    user = request.user.userprofile

    if option == ReturnedTripOption.ALL:
        trips = Trip.objects.all()
    elif option == ReturnedTripOption.TAKING_ME:
        trips = Trip.objects.filter(passengers=user)
    elif option == ReturnedTripOption.IM_GOING:
        trips = Trip.objects.filter(user=user)
    result_trips = []
    for trip in trips:
        result_trips.append(
            {
                "pk": trip.id,
                "departure_time": trip.departure_time.strftime("%H:%M"),
                "arrival_time": trip.arrival_time.strftime("%H:%M"),
                "departure_date": trip.departure_date.strftime("%d.%m.%Y"),
                "arrival_date": trip.arrival_date.strftime("%d.%m.%Y"),
                "departure_city": trip.departure_city.name,
                "destination_city": trip.destination_city.name,
                "user": {
                    "avatar": trip.user.avatar.url if trip.user.avatar else None,
                    "first_name": trip.user.first_name,
                    "last_name": trip.user.last_name,
                },
                "car": {
                    "brand": trip.car.brand,
                    "model": trip.car.model,
                },
                "price": trip.price,
                "still_places_left": trip.max_passengers - trip.passengers.count(),
            }
        )
    return JsonResponse(
        result_trips,
        safe=False,
        status=200,
    )


@router.post("change_user_data", response={200: ChangedUserDataSuccess})
def change_user_data(
    request, data: ChangeUserDataSchema = None, avatar: UploadedFile = None
):
    user = request.auth
    if avatar:
        user.avatar = ContentFile(content=avatar.file.read(), name=avatar.name)
    if data:
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.birth_date = data.birth_date
        user.gender = data.gender
        user.email = data.email
        user.phone_number = data.phone_number
    user.save()
    return JsonResponse(
        {
            "message": "Данные пользователя успешно  изменены",
            "user": {
                "avatar": user.avatar.url if user.avatar else None,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "birth_date": user.birth_date,
                "gender": user.gender,
                "email": user.email,
                "phone_number": user.phone_number,
            },
        },
        safe=False,
        status=200,
    )


@router.post("cancel_trip", response={200: dict})
def cancel_trip(request, trip_id: int, option: str = "im_going"):
    user = request.auth
    if option.lower().strip() == "im_going":
        trip = get_object_or_404(Trip, pk=trip_id, user=user)
        for passenger in trip.passengers.all():
            Notification.objects.create(
                recipient=passenger,
                sender=user.userprofile,
                trip=trip,
                message=f"Поездка {trip.departure_city.name} -> {trip.destination_city.name} отменена водителем",
            )
        trip.delete()
    elif option.lower().strip() == "taking_me":
        user = request.auth
        trip = get_object_or_404(Trip, pk=trip_id, passengers=user)
        Notification.objects.create(
            recipient=trip.user,
            sender=user,
            trip=trip,
            message=f"Пассажир {user.first_name} {user.last_name} не поедет",
        )
        trip.passengers.remove(user)
    return JsonResponse({"message": "Поездка успешно отменена"})


@router.get("get_notifications", response={200: dict})
def get_notifications(request) -> JsonResponse:
    """
    Получает уведомления для пользователя, который делает запрос.

    Args:
        request: Объект запроса.
    Returns:
        dict: Список уведомлений и их количество для пользователя.
    """
    user = request.auth
    notifications = Notification.objects.filter(recipient=user)
    return JsonResponse(
        {"count": notifications.count(), "notifications": list(notifications.values())}
    )
