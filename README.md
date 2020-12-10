# tensor_msgr

1. Перейти в папку msgrjs.
2. Установить зависимости с помощью npm.
```console
$ npm install
```
3. Собрать релизную версию.
```console
$ npm run build
```
4. Переместить папку build в msgr_server
5. Перейти в папку msgr_server
6. Установить зависимости python
```console
$ python3 -m pip install -r ./requirements.txt
```
7. Запустить сервер
```console
$ python3 wsgi.py
```
