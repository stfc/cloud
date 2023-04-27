import logging

mainlogger = logging.getLogger('main')
mainlogger.setLevel(logging.DEBUG)

filehandler = logging.FileHandler('logs/main.log')
filehandler.setLevel(logging.DEBUG)

consolehandler = logging.StreamHandler()
consolehandler.setLevel(logging.DEBUG)

formatter = logging.Formatter("%(asctime)s - %(levelname).4s - %(name)s - %(message)s")
filehandler.setFormatter(formatter)
consolehandler.setFormatter(formatter)

mainlogger.addHandler(filehandler)
mainlogger.addHandler(consolehandler)