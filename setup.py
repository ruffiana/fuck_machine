# -*- coding: utf-8 -*-

# Learn more: https://github.com/ruffiana/fuck_machine/

from setuptools import setup, find_packages


with open('README.md') as f:
    readme = f.read()

with open('LICENSE') as f:
    license = f.read()

setup(
    name='fuck_machine',
    version='1.0.0',
    description='HTML interface for speed control via RPI',
    long_description=readme,
    author='ruffiana',
    author_email='ruffiana.plays@gmail.com',
    url='https://github.com/ruffiana/fuck_machine',
    license=license,
    packages=find_packages(exclude=('tests', 'docs'))
)
