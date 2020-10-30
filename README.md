# globalStorage

* localStorage (polyfill)
* sessionStorage (polyfill)
* cookieStorage
* sheetStorage (google spreadsheets)

### Installation

#### cdn

```html
<script src="https://alex2844.github.io/js-global-storage/dist/js/globalStorage.js"></script>
```

### Usage

sheetStorage one list (https://docs.google.com/spreadsheets/d/1OyZV0RvQQEIvj5gJJcBHLa3RFrYZ7jNae2G1z407KjM/edit?usp=sharing)
```javascript
(async () => {
    window.sheetStorage = await new globalStorage({
        spreadsheet: '1OyZV0RvQQEIvj5gJJcBHLa3RFrYZ7jNae2G1z407KjM',
        lists: [{ id: 'o2zjdup', title: 'chrome' }]
    });
    console.log('sheetStorage', sheetStorage);
    console.log((await sheetStorage.chrome).json);
})();
```

sheetStorage all lists
```javascript
(async () => {
    window.sheetStorage = await new globalStorage({
        url: 'https://docs.google.com/spreadsheets/d/1OyZV0RvQQEIvj5gJJcBHLa3RFrYZ7jNae2G1z407KjM/edit'
    });
    console.log('sheetStorage', sheetStorage);
})();
```

### API

* getItem(key)
* setItem(key, value)
* removeItem(key)
* clear()
* key(i)
* length

### Options

* url - full url connect
* spreadsheet - id (only sheetStorage)
* lists - array lists (only sheetStorage)
* cookie - enable cookieStorage. Defaults `false`.
* default - default config object (only syncStorage). Default `{ welcome: false }`.
* providers - use providers (only syncStorage)
* prefix - localStorage prefix (only syncStorage)

### Todos

* remoteStorage (server api)
* syncStorage (auth and sync google drive) - offline, multiple users
* authStorage (local and provider auth) - ???
* Nodejs

## Build
```
COMPILER=true DEV=false npm run build
```

## Live DEMO

Check a live Demo here https://alex2844.github.io/js-global-storage/
