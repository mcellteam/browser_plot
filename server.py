from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import mimetypes
import time

class MyServer(BaseHTTPRequestHandler):
	def do_GET(self):
		print(self.path);
		if self.path == '/':
			self.path = '/v1.html'

		try:
			self.send_response(200)
			mimetype, _ = mimetypes.guess_type(self.path)
			self.send_header('Content-type', mimetype)
			self.end_headers()

			f = open(os.curdir + os.sep + self.path)
			self.wfile.write(bytes(f.read(), "UTF-8"))
			f.close()
		except IOError:
			self.send_error(404, 'file not found')

def run():
	try:
		print('server running...')
		server_address = ('127.0.0.1', 8000)
		httpd = HTTPServer(server_address, MyServer)
		print('server running...')
		httpd.serve_forever()
	except KeyboardInterrupt:
		print('server terminated')

if __name__ == '__main__':
	run()
