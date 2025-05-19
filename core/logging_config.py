import logging
import sys
import os
from logging.handlers import RotatingFileHandler
from datetime import datetime

def setup_logging(env: str = "development"):
    """
    Настройка логирования для приложения
    
    Args:
        env: Окружение ('development' или 'production')
    """
    # Создаем директорию для логов, если её нет
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Формат логов
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    # Уровень логирования в зависимости от окружения
    log_level = logging.DEBUG if env == "development" else logging.INFO
    
    # Создаем форматтер
    formatter = logging.Formatter(log_format, date_format)
    
    # Настраиваем корневой логгер
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Очищаем существующие обработчики
    root_logger.handlers = []
    
    # Добавляем обработчик для вывода в консоль
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Добавляем обработчик для записи в файл
    log_file = os.path.join(log_dir, f"app_{datetime.now().strftime('%Y%m%d')}.log")
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)
    
    # Устанавливаем уровень логирования для некоторых библиотек
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    
    return root_logger

# Создаем логгер для этого модуля
logger = logging.getLogger(__name__) 