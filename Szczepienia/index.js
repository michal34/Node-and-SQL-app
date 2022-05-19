const express = require('express')
const cookieParser = require('cookie-parser')
const mssql = require('mssql')
const { response, request } = require('express')
const app = express()

const HTTP_PORT = 3000
const DB_LOGIN = 'szczepieniaUser';
const DB_PASSWORD = 'szczepieniaHaslo321';
const DB_SERVER = 'localhost';
const DB_NAME = 'Szczepienia';
const DB_URI = `mssql://${DB_LOGIN}:${DB_PASSWORD}@${DB_SERVER}/${DB_NAME}`

app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())

mssql.connect(DB_URI)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Aplikacja działa pod adresem http://localhost:${HTTP_PORT}`)
    })
  })
  .catch(err => {
    console.error("Błąd połączenia z bazą danych -> ", err)
  })

// ^ Konfiguracja ^

app.get('/api/user', (request, response) => {
  new mssql.Request()
    .input('id', mssql.VarChar(10), request.cookies.user)
    .query('SELECT * FROM Pacjenci WHERE Id = @id')
    .then(result => {
      if (result.recordset.length === 1) {
        response.json(result.recordset[0])
      } else {
        response.json({})
      }
    })
    .catch(err => {
      console.log('Nie udało się pobrać użytkownika -> ', err)
    })
});

app.post('/api/login', (request, response) => {
  new mssql.Request()
    .input('login', mssql.VarChar(20), request.body.login)
    .input('haslo', mssql.VarChar(20), request.body.haslo)
    .query('SELECT * FROM Pacjenci WHERE Login = @login AND haslo = @haslo')
    .then(result => {
      if (result.recordset.length === 1) {
        response.cookie('user', result.recordset[0].Id)
        response.json({
          result: 'OK'
        })
      } else {
        response.status(401).json({
          result: 'ERROR'
        })
      }
    })
})

app.post('/api/logout', (request, response) => {
  response.clearCookie('user');
  
  response.json({
    result: 'OK'
  });
});

app.get('/api/dawki', (request, response) => {
  mssql.query('SELECT * FROM Dawki')
  .then(result => {
    response.json(result.recordset)
  })
  .catch(err => {
    console.log('Nie udało się pobrać dawek ->', err)
  })
})

app.post('/api/placowka', (request, response) => {
  new mssql.Request()
    .query(`SELECT * FROM Placówki WHERE Id = ${request.body.id}`)

    .then(result => {
      response.json(result.recordset)
    })
    .catch(err => {
      console.log('Nie udało się pobrać placówek ->', err)
    })
})

app.post('/api/rejestracja', (request, response) => {
  new mssql.Request()
    .input('imie', mssql.VarChar(20), request.body.imie)
    .input('nazwisko', mssql.VarChar(20), request.body.nazwisko)
    .input('dataSzczepienia', mssql.Date, request.body.dataSzczepienia)
    .input('login', mssql.VarChar(20), request.body.login)
    .input('haslo', mssql.VarChar(20), request.body.haslo)
    .query(`INSERT INTO Pacjenci VALUES('${request.body.placówkaId}', @imie, @nazwisko, @dataSzczepienia, @login, @haslo)`)
    .then(result => {
      response.json(result.recordset)
    })
    .catch(err => {
      console.log('Nie udało się dodać pacjenta ->', err)
    })
})

app.get('/api/information', (request, response) => {
  new mssql.Request()
  .input('id', mssql.VarChar(10), request.cookies.user)
  .query('SELECT * FROM Pacjenci WHERE Id = @id')
    .then(result => {
      response.json(result.recordset)
    })
    .catch(err => {
      console.log('Nie udało się pobrać dawek ->', err)
    })
});

app.post('/api/dawkiInformacje', (request, response) => {
  mssql.query(`SELECT * FROM Dawki WHERE id = '${request.body.id}'`)
    .then(result => {
      response.json(result.recordset)
    })
    .catch(err => {
      console.log('Nie udało się pobrać dawek ->', err)
    })
})

app.delete('/api/usunDawke', (request, response) => {
  mssql.query(`DELETE FROM Dawki WHERE Id = ${request.body.id}`)
    .then(result => {
      response.json(result.recordset)
    })
    .catch(err => {
      console.log('Nie udało się usunąc dawki -> ', err)
    })
})

app.delete('/api/usunPlacowke', (request, response) => {
  mssql.query(`DELETE FROM Placówki WHERE Id = ${request.body.id}`)
    .then(result => {
      response.json(result.recordset)
    })
    .catch(err => {
      console.log('Nie udało się usunąc placówki -> ', err)
    })
})

app.get('/api/placowki', (request, response) => {
  mssql.query('SELECT * FROM Placówki')
  .then(result => {
    response.json(result.recordset)
  })
  .catch(err => {
    console.log('Nie udało się pobrać placówek ->', err)
  })
})

app.post('/api/dodajSzczepionke', (request, response) => {
  new mssql.Request()
    .input('producent', mssql.VarChar(10), request.body.producent)
    .input('terminOd', mssql.Date, request.body.terminOd)
    .input('terminDo', mssql.Date, request.body.terminDo)
    .query(`INSERT INTO Dawki VALUES(${request.body.placówkaId},@producent,${request.body.ilosc},@terminOd,@terminDo)`)
    .then(result => {
      response.json(result.recordset)
    })
    .catch(err => {
      console.log('Nie udało się dodać sczepionki ->', err)
    })
})

app.post('/api/dodajPlacowke', (request,response) => {
  new mssql.Request()
    .input('miasto', mssql.VarChar(10), request.body.miasto)
    .input('ulica', mssql.VarChar(10), request.body.ulica)
    .query(`INSERT INTO Placówki VALUES(@miasto,@ulica,'${request.body.numerBudynku}')`)
    .then(result => {
      response.json(result.recordset)
    })
    .catch(err => {
      console.log('Nie udało się dodać placówki', err)
    })
})