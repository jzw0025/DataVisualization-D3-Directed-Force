var w = 1000,
h = 1000;

var circleWidth = 2.5;

var fontFamily = 'Bree Serif',
fontSizeHighlight = '1.5em',
fontSizeNormal = '1em';

var palette = {
  "lightgray": "#819090",
  "gray": "#708284",
  "mediumgray": "#536870",
  "darkgray": "#475B62",

  "darkblue": "#0A2933",
  "darkerblue": "#042029",

  "paleryellow": "#FCF4DC",
  "paleyellow": "#EAE3CB",
  "yellow": "#A57706",
  "orange": "#BD3613",
  "red": "#D11C24",
  "pink": "#C61C6F",
  "purple": "#595AB7",
  "blue": "#2176C7",
  "green": "#259286",
  "yellowgreen": "#738A05"
}

function getSource() { 
  var xmlhttp = new XMLHttpRequest();
  var url = "http://localhost:2525/";
  var nodeslinks=[] 
  xmlhttp.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
      nodeslinks = myFunction(this.responseText);
    }
  }
    xmlhttp.open("GET", url, false); // the false sets asynchronous communication
    xmlhttp.send();

    function myFunction(response) {
    var nodes = [] // merge the nodes
    var links = []; // merge the links
    var arr = JSON.parse(response);
    for (i = 0; i < arr.results[0].length; i++){
      var obj = {};
      obj.name = arr.results[0][i].name;
      nodes.push(obj)
    };
    for (i = 0; i <arr.results[1].length; i++) { // link in the first section
      var obj = {};
      obj.source = nodes[arr.results[1][i].source];
      obj.target = nodes[arr.results[1][i].target];
      links.push(obj)
    }
    return [nodes,links];
  }
  return nodeslinks;
}

var nodeslink = getSource();
var nodes = nodeslink[0];
var links = nodeslink[1];

// Set up dictionary of neighbors
var node2neighbors = {};
for (var i =0; i < nodes.length; i++){
  var name2 = nodes[i].name
  node2neighbors[name2.label] = links.filter(function(d){
    return d.source.name.label == name2.label || d.target.name.label == name2.label;
  }).map(function(d){
    return d.source.name.label == name2.label ? d.target.name : d.source.name;
  });
}

var vis = d3.select("body")
.append("svg:svg")
.attr("class", "stage")
.attr("width", w)
.attr("height", h);

var force = d3.layout.force()
.nodes(nodes)
.links([])
.size([w, h])
.gravity(0.5)
.friction(0.5)
.charge(-250);

var link = vis.selectAll(".link")
.data(links)
.enter().append("line")
.attr("class", "link")
.attr("stroke", "#CCC")
.attr("fill", "none");

var node = vis.selectAll("circle.node") // create properties for all the node in d3 from the dataset
.data(nodes)
//.enter().append("circle")
.enter().append("g")
.attr("class", "node") 
.attr("id", function(n){ return n.name.id;})

      //MOUSEOVER
      .on("mouseover", function(d,i) {
        link.style('stroke-opacity', function(l) {
          if (d === l.source || d === l.target)
            return 1;
          else
            return 0.1;
        });

        if (i>0) {
          //CIRCLE
          d3.select(this).selectAll("circle")
          .transition()
          .duration(250)
          .style("cursor", "none")     
          .attr("r", circleWidth+3)
          .attr("fill",palette.orange);

          //TEXT
          d3.select(this).select("text")
          .transition()
          .style("cursor", "none")     
          .duration(250)
          .style("cursor", "none")     
          //.attr("font-size","2.5em")
          .attr("x", 15 )
          .attr("y", 5 )
          document.getElementById("sitelink").href=d.name.site; 
          document.getElementById("sitelink").textContent=d.name.label;
        } else {
          //CIRCLE
          d3.select(this).selectAll("circle")
          .style("cursor", "none")     

          //TEXT
          d3.select(this).select("text")
          .style("cursor", "none")     
        }
      })

      //MOUSEOUT
      .on("mouseout", function(d,i) {
        link.style('stroke-width', 1);
        link.style('stroke-opacity', 0.2)

        if (i>=0) {
          //CIRCLE
          d3.select(this).selectAll("circle")
          .transition()
          .duration(250)
          .attr("r", circleWidth)
          .attr("fill",palette.pink);

          //TEXT
          d3.select(this).select("text")
          .transition()
          .duration(250)
          //.attr("font-size","0.1em")
          .attr("x", 8 )
          .attr("y", 4 )
        }
      })
      .on("click", function(n){
        // Determine if current node's neighbors and their links are visible
        var active   = n.active ? false : true // toggle whether node is active
        ,newOpacity = active ? 0 : 1;

        // Extract node's name and the names of its neighbors
        var name     = n.name;
        neighbors  = node2neighbors[name.label];
        alert(neighbors.length)
        //alert(neighbors)
        // Hide the neighbors and their links

        for (var i = 0; i < neighbors.length; i++){
          // get the none-neighbor nodes
            d3.select("g#"+neighbors[i].id).select("text").attr("font-size","0.5em")
          }
        // check each node in the domain, and if it is not contained in the neighbor list, set the transparency to zeros.
        for (var j =0; j < nodes.length; j++){
            var exist = false;
            for (var k = 0; k < neighbors.length; k++){
              if(nodes[j].name.id == neighbors[k].id){
                exist = true;
              }
            }
            if (!exist)// if no contained in the neighbor node list, we set the opacity to zero
              {
                d3.select("g#"+nodes[j].name.id).style("opacity", 0);
              }
              
        }
        // Update whether or not the node is active
        n.active = active;
    })
      .call(force.drag);
    //CIRCLE
    node.append("svg:circle")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", circleWidth)
    .attr("fill", function(d, i) { if (i>=0) { return  palette.pink; } else { return palette.darkgray } } )

    //TEXT
    node.append("text")
    .text(function(d, i) { return d.name.label; })
    .attr("x",            function(d, i) { if (i>=0) { return circleWidth + 5; }   else { return -10 } })
    .attr("y",            function(d, i) { if (i>=0) { return circleWidth + 0 }    else { return 8 } })
    .attr("font-family",  "Bree Serif")
    .attr("fill",         function(d, i) { if (i>=0) { return  palette.darkgray; }        else { return palette.darkgray } })
    .attr("font-size",    function(d, i) { if (i>=0) { return  "0.1em"; }            else { return "1.5em" } })
    .attr("text-anchor",  function(d, i) { if (i>=0) { return  "beginning"; }      else { return "end" } })

    force.on("tick", function(e) {
      node.attr("transform", function(d, i) {     
        return "translate(" + d.x + "," + d.y + ")"; 
      });

      link.attr("x1", function(d)   { return d.source.x; })
      .attr("y1", function(d)   { return d.source.y; })
      .attr("x2", function(d)   { return d.target.x; })
      .attr("y2", function(d)   { return d.target.y; })
    });

    force.start();