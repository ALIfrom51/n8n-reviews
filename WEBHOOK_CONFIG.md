# Configuration Webhook n8n → API

## Étape 1: Récupère IP EC2

```bash
# Sur EC2
curl http://169.254.169.254/latest/meta-data/public-ipv4
# Sortie: 54.123.45.67
```

## Étape 2: n8n + Webhook HTTP POST

Dans n8n, remplace le nœud "When chat message received" par:

1. Ajoute nœud **HTTP Request**
2. Configure:
   - Method: POST
   - URL: http://54.123.45.67:3000/api/reviews
   - Headers: Content-Type: application/json
   - Body (raw JSON):

```json
{
  "text": "{{ $json.output }}",
  "sentiment": "{{ $json.sentiment }}",
  "channel": "{{ $json.channel }}"
}
```

## Étape 3: Connection n8n → API

Flow:
```
When chat message → AI Agent (sentiment) → HTTP POST → /api/reviews
```

L'API reçoit avis et dashboard affiche temps réel.

## Étape 4: Test

```bash
# Depuis EC2 ou local
curl -X POST http://54.123.45.67:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Service excellent",
    "sentiment": "POSITIF",
    "channel": "Gmail"
  }'
```

Ouvre dashboard: http://54.123.45.67:3000/dashboard
Vérifies que avis apparaît.

## Étape 5: Security

Ajoute validation endpoint:

```javascript
app.post('/api/reviews', (req, res) => {
  // Validate
  if (!req.body.text || !req.body.sentiment) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  // ... rest
});
```