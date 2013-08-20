jquery-tetris-menu
==================

A very visual menu, looking like a puzzle to show all items in a minimal space.

## Features
Tetris menu works with two-level menus, i.e. menus with items sorted in categories, but no subcategories.
It allocates categories and items on a grid, recalling the famous puzzle video game Tetris.

- All menu items are visible, so user don't have to move the mouse to get menu items.
- Items are displayed in categories ; each category is depicted with a connected, coloured area.
- Categories are nested within each other, like puzzle pieces, to optimize space.

## Demo
Get the [demo html page](https://raw.github.com/fxdeltombe/jquery-tetris-menu/0.1.4/demo.html), save it as a html file and open it with your favorite browser.

## Usage
Include Tetris plugin *after* the jQuery library:
```html
<script src="/path/to/jquery.tetris.js"></script>
```

Then describe your menu in a JSON object (let's call that object *menu*),

define Tetris global parameters in a hashtable (let's call it *params*),

choose an html element to display the menu in (assume its jQuery selector is *$("div#menu")* ),

and call *$("div#menu").tetris(menu, params)*

Note that you can display several tetris menus on a single web page, with different menus and parameters: they won't conflict.

### How to describe the menu
All parameters are optional. But a category title or an item may not be displayed if there is nothing to display.

#### Category parameters
**id** or **catid**: category id

**color**, **bdcolor** or **border-color**: if not defined, it is read in a default color set (see parameter *defcolors* in *global parameters*)

**bgcolor** or **background-color**: if not defined, it is defined by enlightening the category's border-color (see parameter *colorfactor* in *global parameters*)

**name** or **catname**: category title that will be displayed

**logo** or **catlogo**: category title logo

**desc** or **catdesc**: category title tooltip

(if neither name nor logo are defined, category title is not displayed)

#### Item parameters
**name** or **appname**: item name that will be displayed

**logo** or **applogo**: item logo

**desc** or **appdesc**: item tooltip

**href** or **url** or **uri** or **appuri**: item link target

(if neither name nor logo are defined, item is not displayed)

### Tetris global Parameters
All parameters are optional since they have default values.
For pixel-length parameters, just set the number of pixel, don't suffix it with the unit "px".

#### Cell size
**width**: columns' width (default value: 100px)

**height**: rows' height (default value: 100px)

**side**: if width and height are equal, you can define side instead

#### Logo size
**logowidth**: logos' width (default value: 40px)

**logoheight**: logos' height (default value: 40px)

**logoside**: if logowidth and logoheight are equal, you can define logoside instead

#### Category border
**margin**: category area's margin (default value 2px)

**padding**: category area's padding (default value 4px)

**border** or **border-width**: category area's border-width (default value 2px)

#### Other parameters
**logodir**: if all categories and item logos are in a common directory or prefixed by the same url, you can define it in this parameter

**hrtitles**: if you want category titles to be highlighted with &lt;hr/&gt; above and below, set this parameter to *true*

**targetblank**: if you want html links to be opened in a new tab, set this parameter to *true*

**colorfactor**: if you don't define a category's background-color, it will be defined by enlightening the category's border-color *colorfactor* times (default value is 5)

**defcolors**: if you don't define a category's border-color, it will be read in this array (default value is a six-color array ['#48C', '#F80', '#8C4', '#22F', '#F44', '#EA0'])

