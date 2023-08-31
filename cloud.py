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

@app.route("/machines")
def machines():
    return render_template("machines.html")

@app.route("/faq")
def faqs():
    support_email = 'cloud-support@stfc.ac.uk'
    return render_template("faqs.html", email=support_email)

@app.route("/login", methods=["POST", "GET"])
def login():
        return render_template("login.html")

if __name__ == "__main__":
    app.run(debug=True)