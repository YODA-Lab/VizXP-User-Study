//methods and variables for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip2")				
    .style("opacity", 0);
//Fade in for the tooltip
function tooltip_in(d){
    //show the tooltip
    div.transition()		
        .duration(200)		
        .style("opacity", .9);		
    div.html(d)	
        .style("left", (d3.event.pageX) + "px")		
        .style("top", (d3.event.pageY - 28) + "px");
}

//fade out for the tooltip
function tooltip_out(d) {		
    div.transition()		
        .duration(500)		
        .style("opacity", 0);
}
