# first

this application is a mix between puppeteer and flask project. you need both to get this work.
This is dedicated to self hosted person who want to automatize a bit.

# test project

- first create a users.json file in the same directoy with a bunch of user (usually family scope)
you want them to access app


```json
[
    {
        "nom": "Test",
        "prenom": "Gérard",
        "date": "09/09/1946",
        "lieu": "Lieu dit",
        "addresse": "20 rue de la fourche",
        "ville": "Paris",
        "postal": "75003"
    },
]
```

```console
export FLASK_APP=app_covid.py
flask run -p 8080 -h 0.0.0.0 --reload
```
