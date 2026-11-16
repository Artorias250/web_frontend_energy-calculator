-- KEYS[1]: session:<значение cookie sessionId>.
-- Возвращает ID пользователя; для отсутствующей/истёкшей сессии — nil.
-- Чтение не продлевает TTL сессии.
return redis.call('GET', KEYS[1])
