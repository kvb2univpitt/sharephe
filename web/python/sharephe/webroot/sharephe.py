from webroot import create_app


app = create_app()


if __name__ == '__sharephe__':
    app.run(debug=True)
