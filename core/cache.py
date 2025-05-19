from functools import lru_cache, wraps
from typing import Any, Callable, Optional, TypeVar, cast
import time
from datetime import datetime, timedelta

T = TypeVar('T')

class Cache:
    """Класс для управления кэшированием данных"""
    
    def __init__(self, ttl: int = 300, max_size: int = 1000):
        """
        Инициализация кэша
        
        Args:
            ttl: Время жизни кэша в секундах (по умолчанию 5 минут)
            max_size: Максимальный размер кэша (по умолчанию 1000 элементов)
        """
        self.ttl = ttl
        self.max_size = max_size
        self._cache = {}
        self._timestamps = {}
    
    def get(self, key: str) -> Optional[Any]:
        """
        Получение значения из кэша
        
        Args:
            key: Ключ для поиска в кэше
            
        Returns:
            Значение из кэша или None, если значение не найдено или устарело
        """
        if key not in self._cache:
            return None
            
        if time.time() - self._timestamps[key] > self.ttl:
            del self._cache[key]
            del self._timestamps[key]
            return None
            
        return self._cache[key]
    
    def set(self, key: str, value: Any) -> None:
        """
        Сохранение значения в кэш
        
        Args:
            key: Ключ для сохранения
            value: Значение для сохранения
        """
        if len(self._cache) >= self.max_size:
            # Удаляем самый старый элемент
            oldest_key = min(self._timestamps.items(), key=lambda x: x[1])[0]
            del self._cache[oldest_key]
            del self._timestamps[oldest_key]
            
        self._cache[key] = value
        self._timestamps[key] = time.time()
    
    def delete(self, key: str) -> None:
        """
        Удаление значения из кэша
        
        Args:
            key: Ключ для удаления
        """
        if key in self._cache:
            del self._cache[key]
            del self._timestamps[key]
    
    def clear(self) -> None:
        """Очистка всего кэша"""
        self._cache.clear()
        self._timestamps.clear()

# Создаем глобальный экземпляр кэша
cache = Cache()

def cached(ttl: Optional[int] = None, max_size: Optional[int] = None) -> Callable:
    """
    Декоратор для кэширования результатов функций
    
    Args:
        ttl: Время жизни кэша в секундах (по умолчанию использует значение из cache)
        max_size: Максимальный размер кэша (по умолчанию использует значение из cache)
        
    Returns:
        Декоратор для кэширования
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            # Создаем ключ кэша из имени функции и аргументов
            key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Пробуем получить значение из кэша
            cached_value = cache.get(key)
            if cached_value is not None:
                return cast(T, cached_value)
            
            # Если значения нет в кэше, вызываем функцию
            result = func(*args, **kwargs)
            
            # Сохраняем результат в кэш
            cache.set(key, result)
            
            return result
        return cast(Callable[..., T], wrapper)
    return decorator

def clear_cache_for_function(func: Any) -> None:
    """
    Очистка кэша для конкретной функции
    
    Args:
        func: Имя функции (строка) или объект функции, для которой нужно очистить кэш
    """
    if callable(func):
        # Если передан объект функции, получаем ее имя
        func_name = func.__name__
    else:
        # Если передана строка, используем ее как имя функции
        func_name = str(func)
    
    keys_to_delete = [k for k in cache._cache.keys() if k.startswith(f"{func_name}:")]
    for key in keys_to_delete:
        cache.delete(key)

def clear_all_cache() -> None:
    """Очистка всего кэша"""
    cache.clear() 