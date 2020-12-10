# tensor_msgr

## Собрать фронт
1. Перейти в папку msgrjs
2. Установить зависимости
```console
$ npm install
```
3. Собрать релизную версию
```console
$ npm run build
```
## Установить зависимости сервера и запустить его
1. Перейти в папку msgr_server
2. Установить зависимости python
```console
$ python3 -m pip install -r ./requirements.txt
```
3. Запустить сервер
```console
$ python3 wsgi.py
```
