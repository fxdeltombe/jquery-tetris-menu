(function($){
  var tetrisid = 0
  $.fn.tetris = function(menu, p) {

tetrisid += 1

var width       = p.width  || p.side || 100
var height      = p.height || p.side || 100
var margin      = p.margin  != undefined ? p.margin  : 2
var padding     = p.padding != undefined ? p.padding : 4
var border      = p.border != undefined ? p.border : p['border-width'] != undefined ? p['border-width'] : 2
var logowidth   = p.logowidth  || p.logoside || 40
var logoheight  = p.logoheight || p.logoside || 40
var logodir     = p.logodir || ''
var hrtitles    = p.hrtitles
var targetblank = p.targetblank
var colorfactor = p.colorfactor || 5
var defcolors   = p.defcolors || ['#48C', '#F80', '#8C4', '#22F', '#F44', '#EA0'] // couleurs par défaut

// retourne une couleur prédéfinie parmi six couleurs par défaut
function nextcolor() {
  var color = defcolors.shift()
  defcolors.push(color)
  return color
}

var gap = padding+border+margin
var colorrules = '';
var cssid = 'div#tetris_'+tetrisid

// on remplit une liste de cases
var cells = []
for (i=0; i<menu.length;i++) {
  var cat=menu[i]
  var catid = cat.id || cat.catid || 'tetris_cat_'+i

  var bdcolor = cat.bdcolor || cat['border-color'] || cat.color || nextcolor()
  var bgcolor = cat.bgcolor || cat['background-color'] || lighten(bdcolor, colorfactor)
  colorrules += cssid+' div.t'+catid+', '+cssid+' div.t'+catid+' div.corner {border-color: '+bdcolor+';}'
             +  cssid+' div.t'+catid+' {background-color: '+bgcolor+';}'

  if (cat.name || cat.catname || cat.logo || cat.catlogo)
    cells.push({
      'title': true,
      'name': cat.name || cat.catname,
      'logo': cat.logo || cat.catlogo,
      'desc': cat.desc || cat.catdesc,
      'cat' : catid
    })

  var apps = cat.apps || cat.applications || cat.functions
  if (apps)
    for (j=0; j<apps.length; j++) {
      var app=apps[j]
      if (app.name || app.appname || app.logo || app.applogo) {
        cells.push({
          'name': app.name || app.appname,
          'logo': app.logo || app.applogo,
          'desc': app.desc || app.appdesc,
          'href': app.href || app.url || app.uri || app.appuri,
          'cat' : catid
        })
      }
    }
}

var ie6 = navigator.userAgent.match(/MSIE 6.0/)
var cols, rows, menu

function size(elt, nb) {
  // on compte le nombre de colonnes et de lignes nécessaires
  var w = elt.innerWidth() || elt.width() // car innerWidth() vaut null pour $(window) ou $(document)
  if (w < width + 2*gap) {
    w = width + 2*gap
    if (elt.innerWidth())
      elt.innerWidth(w)
    else
      elt.width(w)
  }
  cols = Math.floor( w / ( width+2*gap ) )
  rows = Math.ceil ( cells.length / cols )
  cols = Math.ceil ( cells.length / rows )
  
  // on construit le tableau
  menu = $('<div>', {'class': 'tetris', 'id': 'tetris_'+tetrisid})
    .css('height', (rows*(height+2*(ie6 ? gap+margin : gap))))
  if (nb == 0)
    elt.append(menu)
  else
    $("#tetris_"+tetrisid).replaceWith(menu)
  
  if ( w > (elt.innerWidth() || elt.width()) && nb < 2 ) // max 2 tentatives de recadrage
    size(elt, nb+1)
  else
    menu.css('width' , (cols*(width +2*(ie6 ? gap+margin : gap))))
}

size(this, 0)


var row = []
for (i=0; i<rows; i++) {
  row[i] = $('<div>', {'class': 'row'})
  menu.append(row[i])
}
var topcell, leftcell=[], topcat, leftcat=[]
// on remplit les lignes
var tobottom, // nbre de cellules au début de la colonne courante à placer en bas
    totop   , // nbre de cellules à la fin de la colonne courante à placer en haut
    prevtotop // nbre de cellules à la fin de la colonne précédente qui ont été placées en haut
var firstcat, // catégorie de la première cellule de la colonne courante
    lastcat,  // catégorie de la dernière cellule de la colonne courante
    prevcat   // catégorie de la dernière cellule de la colonne précédente

for (i=0; i<cols; i++) {
  firstcat = cells[0].cat
  lastcat = cells[rows -1] ? cells[rows -1].cat : undefined

  totop = tobottom = 0
  if (lastcat && firstcat == lastcat) {
    // colonne complète et homogène => placement des cellules trivial
    tobottom = rows
  }
  else if (prevcat && prevcat == firstcat && prevtotop > 0
       && ( !(cells[rows - prevtotop]) || cells[rows - prevtotop].cat != prevcat ) ) {
    // impossible de placer en bas la première catégorie, sous peine de rompre la connexité,
    // car dans la colonne précédente les éléments de la même catégorie sont en haut
    // si la première cellule de la dernière catégorie est un titre, il faut peut-être
    // la permuter avec la première cellule de la colonne suivante pour qu'elle soit plus haute
    if (lastcat && cells[rows] && cells[rows].cat == lastcat) {
      var l = 1
      while (cells[rows-1-l].cat == lastcat)
        l++
      if ( cells[rows-l].title && ( // on ne fait la permutation que si la cellule est une cellule de titre
          cells[rows+l] && cells[rows+l].cat == lastcat
          // plus de cellules de cette catégorie dans la colonne suivante que dans la colonne courante
       || ( cells.length < 2*rows && cells[cells.length-1].cat == lastcat && (rows-l < cells.length-rows) )
          // colonne suivante incomplète et homogène, assez longue pour être placée en haut
      )) {
        var tmpcell = cells[rows-l]
        cells[rows-l] = cells[rows]
        cells[rows] = tmpcell
      }
    }
  }
  else if (lastcat) { // colonne complète: on place la première catégorie en bas et la dernière en haut
    while (cells[tobottom] && firstcat == cells[tobottom].cat)
      tobottom++
    while (cells[rows -1 -totop] && lastcat == cells[rows -1 -totop].cat)
      totop++
  }
  else if (prevcat && prevcat == firstcat) {
    // colonne incomplète (c'est donc la dernière), et problème de connexité
    lastcat = cells[cells.length -1].cat
    if (lastcat != firstcat
        // colonne non homogène: on place la première catégorie en bas
        || prevtotop == 0 && leftcat[cells.length-1] && leftcat[cells.length-1] != firstcat
        // colonne homogène, mais pas assez longue: on place la catégorie en bas pour assurer la connexité
       )
      while (cells[tobottom] && firstcat == cells[tobottom].cat)
        tobottom++
  }

  // pour la prochaine colonne
  prevcat = lastcat
  prevtotop = totop

  // on remplit les cases, en commençant par le bas, puis le milieu, enfin le haut
  for (j=0; j<rows; j++) {
    var k = j<tobottom ? j+rows-tobottom : j>=rows-totop ? j-rows+totop : j+totop-tobottom
    addIntoRow(k, j==0 || k==0 || k==totop)
  }
}

function addIntoRow(l, highest) {
  var celldata = cells.shift()
  if (!celldata) return

  var left, top
  var cellcat = celldata.cat
  // convertir la cellule de gauche
  if (leftcat[l] && leftcat[l] == cellcat) {
    left = 1
    leftcell[l].attr("class", leftcell[l].attr("class")+" right")
    if (ie6 && leftcell[l].attr("class").match(/left/))
      leftcell[l].attr("class", leftcell[l].attr("class")+" left_right")
  }
  // convertir la cellule du dessus
  // cas particulier (si highest est à true): première cellule de la colonne, ou première d'une catégorie
  // => pas besoin de convertir la cellule du dessus
  if (!highest)
    if (topcat && topcat == cellcat) {
      top = 1
      topcell.attr("class", topcell.attr("class")+" bottom")
      if (ie6 && topcell.attr("class").match(/top/))
        topcell.attr("class", topcell.attr("class")+" top_bottom")
    }
  leftcat[l] = topcat = cellcat

  var cell = $(
    '<div class="cell t'+celldata.cat+(left?' left':'')+(top?' top':'')+(celldata.title?' title"':'"')+(celldata.desc?' title="'+celldata.desc+'"':'')+'>'
    + (celldata.href ? '<a href="'+celldata.href+(targetblank ? '" target="_blank"' : '"')+'>' : '')
    + '<span>'
    + (celldata.title && hrtitles ? '<hr/>' : '')
    + (celldata.logo ? '<img src="'+logodir+celldata.logo+'"/>' : '')
    + (celldata.name || '')
    + (celldata.title && hrtitles ? '<hr/>' : '')
    + '</span>'
    + (celldata.href ? '</a>' : '')
    + '</div>'
  )
  row[l].append(cell)
  // coins entrants
    if (left && top && !topcell.attr("class").match(/left/)) {
      cell.addClass("corner_left_top")
      cell.append($('<div class="corner left top"></div>'))
    }
    if (left && !top && leftcell[l].attr("class").match(/top/)) {
      leftcell[l].addClass("corner_right_top")
      leftcell[l].append($('<div class="corner right top"></div>'))
    }
    if (left && leftcell[l].attr("class").match(/bottom/) && (!cells[0] || cells[0].cat != cellcat)) {
      leftcell[l].addClass("corner_right_bottom")
      leftcell[l].append($('<div class="corner right bottom"></div>'))
    }
    if (!left && top && topcell.attr("class").match(/left/)) {
      topcell.addClass("corner_left_bottom")
      topcell.append($('<div class="corner left bottom"></div>'))
    }

  leftcell[l] = topcell = cell
}

$("head").append($(
  '<style type="text/css" id="tetris_'+tetrisid+'_css">'
+ cssid+' {'
+ 'margin: 0 auto;'
+ '}'
+ cssid+' div {'
+ 'border-radius: '+gap+'px;'
+ '-moz-border-radius: '+gap+'px;'
+ '-webkit-border-radius: '+gap+'px;'
+ '}'
+ cssid+' div.left, '+cssid+' div.top {'
+ 'border-top-left-radius: 0;'
+ '-moz-border-radius-topleft: 0;'
+ '-webkit-border-radius-topleft: 0;'
+ '}'
+ cssid+' div.left, '+cssid+' div.bottom {'
+ 'border-bottom-left-radius: 0;'
+ '-moz-border-radius-bottomleft: 0;'
+ '-webkit-border-radius-bottomleft: 0;'
+ '}'
+ cssid+' div.right, '+cssid+' div.bottom {'
+ 'border-bottom-right-radius: 0;'
+ '-moz-border-radius-bottomright: 0;'
+ '-webkit-border-radius-bottomright: 0;'
+ '}'
+ cssid+' div.right, '+cssid+' div.top {'
+ 'border-top-right-radius: 0;'
+ '-moz-border-radius-topright: 0;'
+ '-webkit-border-radius-topright: 0;'
+ '}'
+ cssid+' div.corner_left_top {'
+ 'border-top-left-radius: '+(border+margin)+'px;'
+ '-moz-border-radius-topleft: '+(border+margin)+'px;'
+ '-webkit-border-radius-topleft: '+(border+margin)+'px;'
+ '}'
+ cssid+' div.corner_left_bottom {'
+ 'border-bottom-left-radius: '+(border+margin)+'px;'
+ '-moz-border-radius-bottomleft: '+(border+margin)+'px;'
+ '-webkit-border-radius-bottomleft: '+(border+margin)+'px;'
+ '}'
+ cssid+' div.corner_right_bottom {'
+ 'border-bottom-right-radius: '+(border+margin)+'px;'
+ '-moz-border-radius-bottomright: '+(border+margin)+'px;'
+ '-webkit-border-radius-bottomright: '+(border+margin)+'px;'
+ '}'
+ cssid+' div.corner_right_top {'
+ 'border-top-right-radius: '+(border+margin)+'px;'
+ '-moz-border-radius-topright: '+(border+margin)+'px;'
+ '-webkit-border-radius-topright: '+(border+margin)+'px;'
+ '}'
+ cssid+' div.row {'
+ 'height: '+( height+2*gap )+'px'
+ '}'
+ cssid+' div.row div.cell{'
+ 'float: left;'
+ 'border-style: solid;'
+ 'text-align: center;'
+ 'overflow: hidden;'
+ 'position: relative;'
+ 'height      : '+( ie6 ? height+2*(padding+border) : height )+'px;'
+ 'width       : '+( ie6 ? width +2*(padding+border) : width  )+'px;'
+ 'margin      : '+margin+'px ;'
+ 'padding     : '+padding+'px ;'
+ 'border-width: '+border+'px ;'
+ '}'
+ cssid+' div.row div.cell.top {'
+ 'margin-top: 0;'
+ 'padding-top: '+gap+'px;'
+ 'border-top-width: 0;'
+ '}'
+ cssid+' div.row div.cell.bottom {'
+ 'margin-bottom: 0;'
+ 'padding-bottom: '+gap+'px;'
+ 'border-bottom-width: 0;'
+ '}'
+ cssid+' div.row div.cell.left {'
+ 'margin-left: 0;'
+ 'padding-left: '+gap+'px;'
+ 'border-left-width: 0;'
+ '}'
+ cssid+' div.row div.cell.right {'
+ 'margin-right: 0;'
+ 'padding-right: '+gap+'px;'
+ 'border-right-width: 0;'
+ '}'
+ cssid+' div.row div.cell div.corner {'
+ 'position: absolute;'
+ 'height: 0;'
+ 'width: 0;'
+ 'border-style: solid;'
+ 'border-width: 0;'
+ 'padding: 0;'
+ 'margin: 0;'
+ 'font-size: 0;'
+ '}'
+ cssid+' div.row div.cell div.left {'
+ 'left: 0;'
+ 'border-right-width: '+border+'px;'
+ 'padding-right: '+margin+'px;'
+ 'margin-right: '+padding+'px;'
+ '}'
+ cssid+' div.row div.cell div.top {'
+ 'top: 0;'
+ 'border-bottom-width: '+border+'px;'
+ 'padding-bottom: '+( ie6 ? margin-2 : margin )+'px;'
+ 'margin-bottom: '+padding+'px;'
+ '}'
+ cssid+' div.row div.cell div.right {'
+ 'right: 0;'
+ 'border-left-width: '+border+'px;'
+ 'padding-left: '+margin+'px;'
+ 'margin-left: '+padding+'px;'
+ '}'
+ cssid+' div.row div.cell div.bottom {'
+ 'bottom: 0;'
+ 'border-top-width: '+border+'px;'
+ 'padding-top: '+( ie6 ? margin-2 : margin )+'px;'
+ 'margin-top: '+padding+'px;'
+ '}'
+ cssid+' div.title {'
+ 'font-weight: bold;'
+ '}'
+ cssid+' a {'
+ 'display: block;'
+ '}'
+ cssid+' a:hover {'
+ 'background-color: white;'
+ '}'
+ cssid+' span{'
+ 'height: '+height+'px;'
+ 'width: '+width+'px;'
+ 'margin: 0 auto;'
+ 'overflow: hidden;'
+ 'display: table-cell;'
+ 'vertical-align: middle;'
+ '}'
+ cssid+' img{'
+ 'width: '+logowidth+'px;'
+ 'height: '+logoheight+'px;'
+ 'display: block;'
+ 'margin: auto;'
+ '}'
+ ( ie6 ?
    cssid+' div.row div.left, '+cssid+' div.row div.right { width : '+( width + 2*gap - margin)+'px; }'
  + cssid+' div.row div.left_right                         { width : '+( width + 2*gap         )+'px; }'
  + cssid+' div.row div.top, '+cssid+' div.row div.bottom { height: '+(height + 2*gap - margin)+'px; }'
  + cssid+' div.row div.top_bottom                         { height: '+(height + 2*gap         )+'px; }'
  : '' )
+ colorrules
+ '</style>'
))

  }

/* fonctions de gestion des couleurs */

// pour éclaircir ou assombrir une couleur
// prend en argument une couleur html, par exemple "blue" ou "#0133FD" ou "#03F"
// retourne la couleur [factor] fois plus claire, au format "#0133FD"
function lighten(color, factor) {
    var hsl = rgb2hsl(hex2rgb(html2hex(color)))
    hsl.l = 255 + (hsl.l-255) / factor
    return rgb2hex(hsl2rgb(hsl))
}

// prend en argument une couleur html, par exemple "blue" ou "#0133FD" ou "#03F"
// retourne la même couleur au format "#0133FD"
function html2hex(html) {
  if (/^#([a-f\d]){6}$/i.test(html))
    return html
  if (/^#([a-f\d]){3}$/i.test(html))
    return html.replace(/^#([a-f\d])([a-f\d])([a-f\d])$/i, '#$1$1$2$2$3$3')
  var colors = {
    red   : "FF0000", orange  : "FFA500", darkgray : "A9A9A9", slategray  : "708090", floralwhite      : "FFFAF0",
    tan   : "D2B48C", yellow  : "FFFF00", indianred: "CD5C5C", lightcoral : "F08080", lemonchiffon     : "FFFACD",
    pink  : "FFC0CB", violet  : "EE82EE", firebrick: "B22222", darksalmon : "E9967A", mediumorchid     : "BA55D3",
    gold  : "FFD700", orchid  : "DA70D6", lightpink: "FFB6C1", darkorange : "FF8C00", mediumpurple     : "9370DB",
    plum  : "DDA0DD", purple  : "800080", orangered: "FF4500", papayawhip : "FFEFD5", darkseagreen     : "8FBC8F",
    lime  : "00FF00", indigo  : "4B0082", peachpuff: "FFDAB9", blueviolet : "8A2BE2", lightskyblue     : "87CEFA",
    teal  : "008080", bisque  : "FFE4C4", darkkhaki: "BDB76B", darkviolet : "9400D3", midnightblue     : "191970",
    aqua  : "00FFFF", sienna  : "A0522D", slateblue: "6A5ACD", darkorchid : "9932CC", antiquewhite     : "FAEBD7",
    cyan  : "00FFFF", maroon  : "800000", lawngreen: "7CFC00", chartreuse : "7FFF00", palevioletred    : "DB7093",
    blue  : "0000FF", silver  : "C0C0C0", limegreen: "32CD32", lightgreen : "90EE90", palegoldenrod    : "EEE8AA",
    navy  : "000080", crimson : "DC143C", palegreen: "98FB98", aquamarine : "7FFFD4", darkslateblue    : "483D8B",
    peru  : "CD853F", darkred : "8B0000", darkgreen: "006400", powderblue : "B0E0E6", lightseagreen    : "20B2AA",
    snow  : "FFFAFA", hotpink : "FF69B4", olivedrab: "6B8E23", dodgerblue : "1E90FF", paleturquoise    : "AFEEEE",
    gray  : "808080", thistle : "D8BFD8", lightcyan: "E0FFFF", mediumblue : "0000CD", darkturquoise    : "00CED1",
    coral : "FF7F50", fuchsia : "FF00FF", turquoise: "40E0D0", sandybrown : "F4A460", darkgoldenrod    : "B8860B",
    khaki : "F0E68C", magenta : "FF00FF", cadetblue: "5F9EA0", ghostwhite : "F8F8FF", lavenderblush    : "FFF0F5",
    green : "008000", skyblue : "87CEEB", steelblue: "4682B4", whitesmoke : "F5F5F5", darkslategray    : "2F4F4F",
    olive : "808000", oldlace : "FDF5E6", lightblue: "ADD8E6", lightsalmon: "FFA07A", mediumseagreen   : "3CB371",
    wheat : "F5DEB3", dimgray : "696969", royalblue: "4169E1", lightsalmon: "FFA07A", darkolivegreen   : "556B2F",
    brown : "A52A2A", deeppink: "FF1493", burlywood: "DEB887", lightyellow: "FFFFE0", lightsteelblue   : "B0C4DE",
    white : "FFFFFF", moccasin: "FFE4B5", rosybrown: "BC8F8F", darkmagenta: "8B008B", cornflowerblue   : "6495ED",
    azure : "F0FFFF", lavender: "E6E6FA", goldenrod: "DAA520", greenyellow: "ADFF2F", blanchedalmond   : "FFEBCD",
    beige : "F5F5DC", seagreen: "2E8B57", chocolate: "D2691E", springgreen: "00FF7F", lightslategray   : "778899",
    ivory : "FFFFF0", darkcyan: "008B8B", mintcream: "F5FFFA", forestgreen: "228B22", mediumvioletred  : "C71585",
    linen : "FAF0E6", darkblue: "00008B", aliceblue: "F0F8FF", yellowgreen: "9ACD32", mediumturquoise  : "48D1CC",
    black : "000000", cornsilk: "FFF8DC", mistyrose: "FFE4E1", deepskyblue: "00BFFF", mediumslateblue  : "7B68EE",
    salmon: "FA8072", honeydew: "F0FFF0", gainsboro: "DCDCDC", navajowhite: "FFDEAD", mediumaquamarine : "66CDAA",
    tomato: "FF6347", seashell: "FFF5EE", lightgrey: "D3D3D3", saddlebrown: "8B4513", mediumspringgreen: "00FA9A",
    lightgoldenrodyellow : "FAFAD2" }
  if (colors[html.toLowerCase()])
    return '#' + colors[html.toLowerCase()]
  console.log('invalid html color "' + html + '"')
  return "#FFFFFF"
}

// prend en argument une chaine de la forme "#0133FD",
// retourne un objet avec trois paramètres : r, g, b
function hex2rgb(hex) {
    // Expand shorthand form (e.g. "#03F") to full form (e.g. "#0033FF")
    //hex = hex.replace(/^#([a-f\d])([a-f\d])([a-f\d])$/i, '#$1$1$2$2$3$3')
    var result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

// convertit un nombre décimal en hexadécimal sur au moins deux caractères
function component2hex(c) {
    var hex = c.toString(16)
    return hex.length == 1 ? "0" + hex : hex
}

// prend en argument un objet avec trois paramètres : r, g, b,
// retourne une chaine de la forme "#0133FD"
function rgb2hex(rgb) {
    return "#" + component2hex(rgb.r) + component2hex(rgb.g) + component2hex(rgb.b)
}

// prend en argument un objet avec trois paramètres : r, g, b,
// retourne un objet avec trois paramètres : h, s, l
function rgb2hsl (rgb)
{
  var r = Math.round (rgb.r),
      g = Math.round (rgb.g),
      b = Math.round (rgb.b)
  var minval = Math.min (r, Math.min (g, b)),
      maxval = Math.max (r, Math.max (g, b))
  var mdiff = maxval - minval + 0.0
  var msum = maxval + minval + 0.0
  var luminance = msum / 510.0
  var saturation
  var hue
  if (maxval == minval) {
    saturation = 0.0
    hue = 0.0
  } else {
    var rnorm = (maxval - r) / mdiff
    var gnorm = (maxval - g) / mdiff
    var bnorm = (maxval - b) / mdiff
    saturation = (luminance <= 0.5) ? (mdiff / msum) : (mdiff / (510.0 - msum))
    if (r == maxval)
      hue = 60.0 * (6.0 + bnorm - gnorm)
    if (g == maxval)
      hue = 60.0 * (2.0 + rnorm - bnorm)
    if (b == maxval)
      hue = 60.0 * (4.0 + gnorm - rnorm)
    if (hue > 360.0)
      hue -= 360.0
  }
  return {
    h: Math.round (hue * 255.0 / 360.0),
    s: Math.round (saturation * 255.0),
    l: Math.round (luminance * 255.0)
  }
}

function Magic (rm1, rm2, rh) {
  var retval = rm1
  if (rh > 360.0)
    rh -= 360.0
  if (rh < 0.0)
    rh += 360.0
  if (rh < 60.0)
    retval = rm1 + (rm2 - rm1) * rh / 60.0
  else if (rh < 180.0)
    retval = rm2
  else if (rh < 240.0)
    retval = rm1 + (rm2 - rm1) * (240.0 - rh) / 60.0
  return Math.round (retval * 255)
}

// prend en argument un objet avec trois paramètres : h, s, l
// retourne un objet avec trois paramètres : r, g, b
function hsl2rgb (hsl) {
  var h = hsl.h * 360.0 / 255.0,
      s = hsl.s / 255.0,
      l = hsl.l / 255.0
  var r, g, b
  if (s == 0.0) {
    r = g = b = Math.round (l * 255.0)
  } else {
    var rm1, rm2
    if (l <= 0.5)
      rm2 = l + l * s
    else
      rm2 = l + s - l * s
    rm1 = 2.0 * l - rm2
    r = Magic (rm1, rm2, h + 120.0)
    g = Magic (rm1, rm2, h)
    b = Magic (rm1, rm2, h - 120.0)
  }
  return {
    r: r,
    g: g,
    b: b
  }
}

})(jQuery)
