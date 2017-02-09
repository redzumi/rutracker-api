# rutracker-api
Small API module for rutracker.org. 
Authentication, search, files download.

## Installation
```
npm install https://github.com/redzumi/rutracker-api
```

## Usage
```javascript
import RutrackerAPI from 'rutracker-api';
// or
const RutrackerAPI = require('rutracker-api').default;

const rutracker = new RutrackerAPI();
```

## API

#### login

Before using ```search```, you should log in.

Option | Type | Default value | Description |
:---:|:---:|:---:|:---:|
login | string | - | -
password | string | - | -
options | object | - | -

```javascript
rutracker.login('login', 'pass')
    .then(() => {
        ...
    })
    .catch((err) => {
        ...
    });
```

##### Error

Error is an object with the following schema:

Property | Type | Note
---|---|---|
message | string 
captcha | string | e.g. ```"http://static.t-ru.org/captcha/***.jpg?***"```
cap_sid | string | e.g. ```"jj2maJS13EwbeXcqIS37"```
cap_code | string | e.g. ```"cap_code_17b40236v0be374bd46ad063974if892"```

##### Captcha
You can use it in ```login``` options:

```javascript
rutracker.login('login', 'pass', {
  cap_sid: 'jj2maJS13EwbeXcqIS37',
  cap_code_17b40236v0be374bd46ad063974if892: 'mg29' //captcha code
})
...
```
***

#### search

Returns SearchCursor.

Option | Type | Default Value | Description |
:---:|:---:|:---:|:---:|
query | string | - | -

```javascript
// results from first page
rutracker.search('Kure-nai').exec()
  .then((results) => {
    ...
  })
```


#### SearchCursor
##### .page

Maximum pages count is 10, and maximum topics count is 500. 

```javascript
rutracker.search('jazz').page(3).exec()
  .then((results) => {
    ...
  })
```

##### .forum

Results from specific forum.

```javascript
rutracker.search('jazz').forum(2288).exec()
  .then((results) => {
    ...
  })
```

##### Don't forget about ```.exec()``` in the end.

Results in an array of objects with the following schema:

Property | Type | Note
---|---|---|
state | string | e.g. ```"проверено"```
id | string
category | string | e.g. ```"Аниме (HD Video)"```
title | string
author | string
size | string | 
seeds | string | e.g. ```"3"```
leechs | string | e.g. ```"0"```
url | string | e.g. ```"http://rutracker.org/forum/viewtopic.php?t=***"```

***

#### topic

Topic information.

Option | Type | Default Value | Description |
:---:|:---:|:---:|:---:|
id | string | - | Topic ID (e.g. ```"5351337"```) |
```javascript
rutracker.topic('5351337')
  .then((topic) => {
    ...
  })
```
Topic is an object with the following schema:

Property | Type | Note
---|---|---|
created | string | e.g. ```"02-Фев-17 18:59"```
since | string | e.g. ```"(6 дней назад)"```
image | string | Poster url. (e.g. ```"http://***.ru/***.jpg"```)
magnet | string  | e.g. ```"magnet:?xt=urn:btih:***"```
raw_body | string

***

#### download

```.torrent``` file download.

Option | Type | Default Value | Description |
:---:|:---:|:---:|:---:|
id | string | - | -
path | string | - | -
```javascript
rutracker.download('5351337', './5351337.torrent')
  .then(() => {
    ...
  });
```

***
