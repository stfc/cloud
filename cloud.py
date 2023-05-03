from flask import Flask, render_template, request, url_for, redirect, session

app = Flask(__name__)
app.secret_key = b'REFERENCE_KEY'

@app.route("/")
def home():
    return render_template("homepage.html")

@app.route("/tos")
def terms():
    return render_template("tos.html")

@app.route("/sla")
def sla():
    return render_template("sla.html")

# @app.route("/faqs")
# def faqs():
#     return "Frequently Asked Questions Page <h1>FAQ<h1>"

@app.route("/login", methods=["POST", "GET"])
def login():
        return render_template("login.html")

# @app.route("/user")
# def user():
#     if "user" in session:
#         user = session["user"]
#         return render_template("testpage.html", passdata=user)
#     else:
#         return redirect(url_for("login"))

if __name__ == "__main__":
    app.run()