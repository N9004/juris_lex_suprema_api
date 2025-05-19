# app/exceptions/crud_exceptions.py

class CrudException(Exception):
    """Базовый класс для исключений CRUD-слоя."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class NotFoundException(CrudException):
    """Исключение для случаев, когда сущность не найдена."""
    def __init__(self, entity_name: str, entity_id: int | str | None = None):
        message = f"{entity_name} "
        if entity_id is not None:
            message += f"с ID '{entity_id}' "
        message += "не найден(а)."
        super().__init__(message, status_code=404)
        self.entity_name = entity_name
        self.entity_id = entity_id

class DuplicateEntryException(CrudException):
    """Исключение для случаев дублирования записи (например, уникальное поле)."""
    def __init__(self, entity_name: str, conflicting_field: str, conflicting_value: str):
        message = f"{entity_name} с {conflicting_field} '{conflicting_value}' уже существует."
        super().__init__(message, status_code=409) # 409 Conflict
        self.entity_name = entity_name
        self.conflicting_field = conflicting_field
        self.conflicting_value = conflicting_value

class InvalidInputException(CrudException):
    """Исключение для невалидных входных данных (дополнительно к валидации Pydantic)."""
    def __init__(self, message: str = "Предоставлены неверные входные данные."):
        super().__init__(message, status_code=400) # 400 Bad Request

class DatabaseOperationException(CrudException):
    """Общее исключение для ошибок операций с базой данных."""
    def __init__(self, message: str = "Произошла ошибка при обращении к базе данных."):
        super().__init__(message, status_code=500) # 500 Internal Server Error

# Можно добавить и другие специфичные исключения по мере необходимости
# например, PermissionDeniedException(CrudException) и т.д. 