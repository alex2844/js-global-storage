# globalStorage

  - localStorage (polyfill)
  - sessionStorage (polyfill)
  - cookieStorage
  - sheetStorage (google spreadsheets)

### Installation

#### cdn

```html
<script src="https://alex2844.github.io/js-global-storage/dist/js/globalStorage.js"></script>
```

### Usage

sheetStorage one list (https://drive.google.com/drive/folders/1GSSYCkbtah2jwNWmKA_bPynVYCTZBycS?usp=sharing)
```javascript
(async () => {
    window.sheetStorage = await new globalStorage({
        spreadsheet: '1gONg1oQAdScmV0ueqIzJiwybSCBjVN3CFvDFfMLS67k',
        lists: [{ id: 'osikvag', title: 'chrome' }]
    });
    console.log('sheetStorage', sheetStorage);
    console.log((await sheetStorage.chrome).json);
})();
```

sheetStorage all lists
```javascript
(async () => {
    window.sheetStorage = await new globalStorage({
        url: 'https://docs.google.com/spreadsheets/d/1gONg1oQAdScmV0ueqIzJiwybSCBjVN3CFvDFfMLS67k/edit'
    });
    console.log('sheetStorage', sheetStorage);
})();
```

### API

 - getItem(key)
 - setItem(key, value)
 - removeItem(key)
 - clear()
 - key(i)
 - length

### Options

 - url - full url connect
 - spreadsheet - id (only sheetStorage)
 - lists - array lists (only sheetStorage)
 - cookie - enable cookieStorage. Defaults `false`.

### Todos

 - remoteStorage (server api)
 - syncStorage (auth and sync google drive)
 - Nodejs

## Live DEMO

Check a live Demo here https://alex2844.github.io/global-storage/
