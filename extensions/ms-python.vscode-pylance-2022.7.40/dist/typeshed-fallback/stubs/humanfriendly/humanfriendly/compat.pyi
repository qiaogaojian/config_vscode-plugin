from html.parser import HTMLParser as HTMLParser
from io import StringIO as StringIO

unicode = str
unichr = chr
basestring = str
interactive_prompt = input

def coerce_string(value): ...
def is_string(value): ...
def is_unicode(value): ...
def on_macos(): ...
def on_windows(): ...