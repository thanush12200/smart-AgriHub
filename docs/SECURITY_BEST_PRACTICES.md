# Security Best Practices

1. Authentication and Authorization
- Use strong `JWT_SECRET` (32+ bytes).
- Keep token expiry short (7d max, refresh token flow for enterprise).
- Enforce RBAC checks on every admin route.

2. Credential Safety
- Store secrets in cloud secret manager, not `.env` in repo.
- Rotate API keys (weather provider, DB credentials).

3. API Hardening
- Enable HTTPS everywhere.
- Keep `helmet`, `rate-limit`, and strict CORS origin allow-list.
- Validate payloads (Zod/Joi in backend for stricter runtime validation).

4. Data Protection
- Hash passwords using bcrypt (already implemented).
- Encrypt backups and logs at rest.
- Minimize PII in logs.

5. ML Safety
- Version and sign model artifacts.
- Validate schema before inference.
- Fallback behavior when confidence is low or model unavailable.

6. Monitoring
- Add centralized logging and alerting (ELK/Grafana/CloudWatch).
- Track auth failures and unusual admin activities.
