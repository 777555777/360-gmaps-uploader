Senden Sie eine HTTP-Anfrage:
Sobald Sie den API-Schlüssel und das Zugriffstoken haben, können Sie den folgenden Befehl ausführen: in einer Shell, um einen HTTP-Aufruf an den Dienst auszuführen. Im folgenden Beispiel Rufen Sie die Methode /v1/photo:startUpload auf.

```sh
curl --request POST \
--url 'https://streetviewpublish.googleapis.com/v1/photo:startUpload?key=YOUR_API_KEY' \
--header 'authorization: Bearer YOUR_ACCESS_TOKEN' \
--header 'Content-Length: 0'
```

Beispielanforderungen
Wenn Sie mit dem Senden der obigen HTTP-Anfrage einverstanden sind, versuchen Sie, zusätzliche . Unten werden verschiedene Anrufe angezeigt.

Eine Liste deiner Fotos wird abgerufen

```sh
curl --request GET \
--url 'https://streetviewpublish.googleapis.com/v1/photos?key=YOUR_API_KEY' \
--header 'authorization: Bearer YOUR_ACCESS_TOKEN'
```

Foto wird abgerufen...

```sh
curl --request GET \
--url 'https://streetviewpublish.googleapis.com/v1/photo/PHOTO_ID?key=YOUR_API_KEY' \
--header 'authorization: Bearer YOUR_ACCESS_TOKEN'
```

Foto wird hochgeladen
Zum Erstellen eines Fotos sind drei separate Aufrufe erforderlich. Beim ersten Aufruf wird eine Upload-URL zurückgegeben. mit dem im zweiten Aufruf die Fotobytes hochgeladen werden. Nachdem die Fotobytes hochgeladen wurden, lädt der dritte Aufruf die Metadaten des Fotos hoch und gibt die Foto-ID zurück.

> Achtung: Sie müssen die Veröffentlichung Akzeptanzkriterien vor der Veröffentlichung eines Fotos. Außerdem müssen für deine Fotos die beschriebenen Metadaten in Photo Sphere XMP Metadata (XMP-Metadaten auf Photo Sphere) ein.

1. Upload-URL anfordern

```sh
curl --request POST \
--url 'https://streetviewpublish.googleapis.com/v1/photo:startUpload?key=YOUR_API_KEY' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
--header 'Content-Length: 0'
```

2. Fotobytes in die Upload-URL hochladen

```sh
curl --request POST \
--url 'UPLOAD_URL' \
--upload-file 'PATH_TO_FILE' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

3. Metadaten des Fotos hochladen

```sh
curl --request POST \
--url 'https://streetviewpublish.googleapis.com/v1/photo?key=YOUR_API_KEY' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
            "uploadReference":
            {
            "uploadUrl": "UPLOAD_URL"
            },
            "pose":
            {
                "heading": 105.0,
                "latLngPair":
                {
                "latitude": 46.7512623,
                "longitude": -121.9376983
                }
            },
            "captureTime":
            {
            "seconds": 1483202694
            },
        }'
```
