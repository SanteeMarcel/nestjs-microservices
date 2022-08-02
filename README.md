## Description

Microservices running through containers using NestJS backend

## Installation

Clone this repo.

Add values on .env.example and rename it to .env

Install Docker

run `docker-compose up`

access `localhost:3001/docs` on a web browser

## Run tests

services test:

`npm run test`

e2e tests:

`npm run test:e2e`

# API Service description

> Version 1.0

API Service for querying stocks.

## Path Table

| Method | Path | Description |
| --- | --- | --- |
| POST | [/register](#postregister) | Register user email and role, returns the same email and access token. |
| POST | [/reset-password](#postreset-password) | Reset password and send it by email. |
| GET | [/stock](#getstock) | Query stocks like aapl.us, return stock information. Must be authenticated. |
| GET | [/history](#gethistory) | Get User history based on Auth Bearer Token. |
| GET | [/stats](#getstats) | Super-users can get the top 5 queried stocks.  |

## Path Details

***

### [POST]/register

#### RequestBody

- application/json

```ts
{
  email: string
  role: string
}
```

#### Responses

- 201 User created successfully

`application/json`

```ts
{
  email: string
  access_token: string
}
```

- 400 User already exists

***

### [POST]/reset-password

#### RequestBody

- application/json

```ts
{
  email: string
}
```

#### Responses

- 200 Password reset email sent

- 400 Invalid query

- 401 User not found

***

### [GET]/stock

- Security  
bearer  

#### Parameters(Query)

```ts
q: string
```

#### Responses

- 200 

`application/json`

```ts
{
  name: string
  symbol: string
  open: number
  close: number
  high: number
  low: number
}
```

- 400 Missing query parameter

- 401 Unauthorized

- 404 Stock not found

***

### [GET]/history

- Security  
bearer  

#### Responses

- 200 

`application/json`

```ts
{
  date: string
  name: string
  symbol: string
  open: number
  close: number
  high: number
  low: number
}[]
```

- 401 Unauthorized

***

### [GET]/stats

- Security  
bearer  

#### Responses

- 200 

`application/json`

```ts
{
  stock: string
  times_requested: number
}[]
```

- 401 Super-users only

# Stock Service description

> Version 1.0

API Service for querying stocks.

## Path Table

| Method | Path | Description |
| --- | --- | --- |
| GET | [/](#) | Fetches stock information from stooq |
