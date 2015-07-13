import os
import sys
import subprocess
import shutil

def find_in_path(program_name):
	for path in os.environ.get('PATH', '').split(os.pathsep):
		full_name = os.path.join(path, program_name)
		if os.path.exists(full_name) and not os.path.isdir(full_name):
			return full_name
	return None

def get_name():
	return ("Browser Plotter")

def requirements_met():
	return True

def plot(data_path, plot_spec):
	program_path = os.path.dirname(__file__)
	python_cmd = find_in_path("python3")
	#python_cmd = shutil.which("python", mode=os.X_OK)

	if python_cmd is None:
		print("Unable to plot: python not found in path")
	else:
		plot_cmd = []
		plot_cmd.append(python_cmd)
		plot_cmd.append(os.path.join(program_path, "server.py"))
		
		plot_cmd.append(data_path)
		for spec in plot_spec.split():
			plot_cmd.append(spec)

		print ("Plotting with: \"" + ' '.join(plot_cmd) + "\"")
		pid = subprocess.Popen(plot_cmd, cwd = program_path)
