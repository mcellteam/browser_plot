from http.server import BaseHTTPRequestHandler, HTTPServer
import os

class MyServer(BaseHTTPRequestHandler):
	def do_GET(self):
		try:
			if self.path == "/":
				self.path = "/v1.html"
			if self.path.endswith('v1.html'):
				f = open(os.curdir+os.sep+self.path) #open requested file
				#send code 200 response
				self.send_response(200)
				
				#send header first
				self.send_header('Content-type', 'text/html')
				self.end_headers()

				#send file content to client
				self.wfile.write(bytes(f.read(), "UTF-8"))
				f.close()
			if self.path.endswith('.css'):
				f = open(os.curdir + os.sep + self.path)
				self.send_response(200)
				self.send_header('Content-type', 'text/css')
				self.end_headers()
				self.wfile.write(bytes(f.read(), "UTF-8"))
				f.close()
			if self.path.endswith('.js'):
				f = open(os.curdir + os.sep + self.path)
				self.send_response(200)
				self.send_header('Content-type', 'text/js')
				self.end_headers()
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
