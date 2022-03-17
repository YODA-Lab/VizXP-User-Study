// Author: Ashwin Kumar
w =400
h=600
svg = d3.select('#viz')
svg.attr('x',0)
    .attr('y',0)
    .attr('width', '100%')
    // .attr('height', h)
    .attr('viewBox', '0 0 ' + (w) + ' ' + (h))
    // .style("margin-left","30px")
    .style("margin-top","2%")
    .style('background',"#eeeeee")

d3.json(window.location.href+'/../planning_started').then(function(preload_data){
    viz_type = preload_data.viz_type;
    if(viz_type=='viz'){
        d3.select('#menu_viz').select('iframe')
            .attr('src','../static/viz_tutorial.html')
            .attr('height','500')
    }
    else if(viz_type=='text'){
        d3.select('#menu_viz').select('iframe')
            .attr('src','../static/text_tutorial.html')
            .attr('height','500')
    }
    console.log(preload_data)
    if(preload_data.problem==false){
        d3.select('#problem_change').html("location1")
    }

//initializing draggable sort
$(function  () {
    $("ol.draglist").sortable();
  });

    
d3.select('#header_big').select('span')
  .on('click',function(){
      introJs().start(); 
    //   d3.select('.introjs-tooltipbuttons').remove()
    });
// Append Div for tooltip to SVG
var tooltip_div = d3.select("body")
        .append("div")   
        .attr("class", "tooltip2")               
        .style("opacity", 0);

//Fade in for the tooltip
function tooltip_in(d, mouse){
    //show the tooltip
    tooltip_div.transition()		
        .duration(200)		
        .style("opacity", .9);		
    if(mouse){
        tooltip_div.html(d)	
        .style("left", (mouse[0] +10) + "px")		
        .style("top", (mouse[1] - 34) + "px");
        return 0;
    }
    tooltip_div.html(d)	
        .style("left", (d3.event.pageX +10) + "px")		
        .style("top", (d3.event.pageY - 34) + "px");
}
//fade out for the tooltip
function tooltip_out(d) {		
    tooltip_div.transition()		
        .duration(500)		
        .style("opacity", 0);
}

action_stack = []
objects = null

//loading objects by type
d3.json('../static/data/objects.json').then(function(data){
    objects = data
})

//loading list of actions from file and populating dropdown
d3.json('../static/data/action_list.json').then(function(data){
    console.log(data)
    d3.select('#action_select').selectAll('option').data(data)
        .enter()
        .append('option').attr('value', function(d){return d.name}).html(function(d){return d.name}).attr('desc', function(d){ return d.desc})
    d3.select('#edit_action_select').selectAll('option').data(data)
        .enter()
        .append('option').attr('value', function(d){return d.name}).html(function(d){return d.name}).attr('desc', function(d){ return d.desc})
    
    introJs().start();

    test();
})

//update input drop downs and description on changing selected action
d3.select('#action_select').on("change", function(){
    sel = d3.select('#action_select option:checked');
    d3.select('#action_description').html(sel.attr('desc'))
    d = sel.data()[0]
    div = d3.select('#input_selects')
    div.selectAll('*').remove();
    d.inputs.forEach(function(d,i){
        div.append('label').html(d.name+": ")
        div.append('p')
        div.append('select').attr('id','input_select'+i).selectAll('option').data(objects[d.type])
            .enter()
            .append('option').attr('value', function(d){return d}).html(function(d){return d})
        div.append('p')
    })
    
})

//Update input dropdown when editing action
d3.select('#edit_action_select').on("change", update_edit)
function update_edit(){
    sel = d3.select('#edit_action_select option:checked');
    d3.select('#edit_action_description').html(sel.attr('desc'))
    d = sel.data()[0]
    div = d3.select('#edit_input_selects')
    div.selectAll('*').remove();
    d.inputs.forEach(function(d,i){
        div.append('label').html(d.name+": ")
        // div.append('p')
        div.append('select').attr('id','edit_input_select'+i).selectAll('option').data(objects[d.type])
            .enter()
            .append('option').attr('value', function(d){return d}).html(function(d){return d})
        // div.append('p')
    })
}
//click listener for adding action
document.getElementById('add_action_button').addEventListener('click',add_action)
document.getElementById('submit_confirm').addEventListener('click',submit_plan)

document.getElementById('refresh').addEventListener('click', test)

function test(){
    if(viz_type == "conductor")
        test_plan_conductor();
    else if(viz_type == "abstraction")
        test_plan_abstraction();
    else if(viz_type == "text")
        test_plan_text();
    else if(viz_type == "viz")
        test_plan_viz();
}

function print(txt){
    console.log(txt)
}

//function to add an action to the plan preview
function add_action(){

    sel = d3.select('#action_select option:checked');
    text = sel.attr('value')+'(';
    //adding names of all selected inputs to text
    input_list = []
    for(i=0;i<sel.data()[0].inputs.length;i++){
        text += document.getElementById('input_select'+i).value +', ';
        input_list.push(document.getElementById('input_select'+i).value)
    }
    text = text.slice(0, text.length-2);
    text+=')'
    action_stack.push(text)
    div = d3.select('#plan_preview_list')
    sel = div.append('li').data([input_list,0]).attr('class','action row').html(text).attr('draggable','true')
    sel.append('span').attr('class','edit').html('<i class="material-icons">close</i>').on('click',function(){d3.select(this.parentNode).remove(); test()})
        // .attr('data-step',5).attr('data-intro',"Clicking this button allows you to edit the action and its parameters")
    // sel.append('span').attr('class','close').html('x').on('click',function(){d3.select(this.parentNode).remove()})
    sel.append('span').attr('class','edit').html('<i class="material-icons">mode_edit</i>').on('click', edit_action)
        // function(d){
        //     //is there a need to create a new layout for editing? Adding new action and draggin can also work.
        // })
        //.append('button').html('X').style('margin-right','0px').on('click',function(){d3.select(this.parentNode).remove()})

    test();
}
function add_action_auto(action, input_list){
    text = action + '('
    for(i=0;i<input_list.length;i++){
        text+=input_list[i]+', '
    }
    text = text.slice(0, text.length-2);
    text+=')'
    action_stack.push(text)
    div = d3.select('#plan_preview_list')
    sel = div.append('li').data([input_list,0]).attr('class','action row').html(text).attr('draggable','true')
    sel.append('span').attr('class','edit').html('<i class="material-icons">close</i>').on('click',function(){d3.select(this.parentNode).remove(); test()})
    sel.append('span').attr('class','edit').html('<i class="material-icons">mode_edit</i>').on('click', edit_action)
    test();
}
// add_action_auto("move-truck",['truck1', 'location4', 'location3', 'city2'])
// add_action_auto("unload-airplane",['package1','airplane2', 'location4'])

// add_action_auto('load-airplane', ['package1', 'airplane1', 'location3'])
// add_action_auto("move-airplane", ["airplane1", "location3", "location1"])
// add_action_auto("unload-airplane", ["package1", "airplane1", "location1"])
// add_action_auto("load-truck", ["package1", "truck2", "location1"])
// add_action_auto("move-truck", ["truck2", "location1", "location2", "city1"])
// add_action_auto("unload-truck", ["package1", "truck2", "location2"])

//Funtion to edit an action
function edit_action(inputs){
    step = d3.select(this.parentNode)
    console.log(inputs, step.data())
    action = step.html().split('(')[0]
    d3.select('#edit_modal_name').html(step.html().split('<')[0])

    //update selected action in edit modal
    document.getElementById('edit_action_select').value=action;
    update_edit()

    //update selected inputs in edit modal
    for(i=0;i<sel.data()[0].inputs.length;i++){
        document.getElementById('edit_input_select'+i).value=inputs[i];
    }
    $('#edit_modal').modal('show')
    d3.select('#edit_action_confirm').on('click', function(){
        sel = d3.select('#edit_action_select option:checked');
        text = sel.attr('value')+'(';
        //adding names of all selected inputs to text
        input_list = []
        for(i=0;i<sel.data()[0].inputs.length;i++){
            text += document.getElementById('edit_input_select'+i).value +', ';
            input_list.push(document.getElementById('edit_input_select'+i).value)
        }
        text = text.slice(0, text.length-2);
        text+=')'
        console.log(step.node())
        step = d3.select(step.node()).data([input_list])
        step.html(text)
        step.append('span').attr('class','edit').html('<i class="material-icons">close</i>').on('click',function(){d3.select(this.parentNode).remove()})
        // sel.append('span').attr('class','close').html('x').on('click',function(){d3.select(this.parentNode).remove()})
        step.append('span').attr('class','edit').html('<i class="material-icons">mode_edit</i>').on('click', edit_action)
        $('#edit_modal').modal('hide')

        test();
    })
}

//create data structure for the plan and save it
function submit_plan(){
    sel = d3.select('#plan_preview_list').selectAll('li');
    // print(sel)
    plan_data = []
    sel.each(function(){
        item = d3.select(this);
        // a = {"action":item.html().split('(')[0], 'inputs':item.data()}
        a = [item.html().split('(')[0]].concat(item.data()[0])
        plan_data.push(a)
    })
    action_stack = []
    sel._groups[0].forEach(function(d){
        action_stack.push(d.innerHTML.split('<span')[0])
    })
    print(action_stack)
    print(plan_data)
    // request =  d3.request('/submit_data')
    // request.send('POST',plan_data)
    d3.json(window.location.href+'/../submit/'+ JSON.stringify(plan_data)
    // , {
    //   method:"POST",
    //   body: JSON.stringify(plan_data),
    //   headers: {
    //     "Content-type": "application/json; charset=UTF-8"
    //   }
    // }

    ).then(function(url){
        console.log(url)
        window.location.replace(url);
    })
}




/*
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
//Visualization Modal Elements below this point
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
*/


///////////////////////////////////////////////////////////////////////////////////////
// FOR TEXT


function test_plan_text(){
    sel = d3.select('#plan_preview_list').selectAll('li');
    plan_data = []
    sel.each(function(){
        item = d3.select(this);
        a = [item.html().split('(')[0]].concat(item.data()[0])
        plan_data.push(a)
    })
    action_stack = []
    sel._groups[0].forEach(function(d){
        action_stack.push(d.innerHTML.split('<span')[0])
    })
    print(action_stack)
    print(plan_data)

    svg.selectAll('*').remove()

    //get flow data from backend
    d3.json(window.location.href+'/../test/'+ JSON.stringify(plan_data)).then(function(data){
        flow_data = data[1];
        state_data = data[0];
        svg.attr('viewBox', '0 0 ' + (w) + ' ' + (50*flow_data.length)).attr('width','80%')
        console.log(flow_data)
        flow_data.forEach(function(d, i){
            let neutral_color = '#cccccc'
            let highlight_color = '#ffaaaa'
            bad = false
            if(d3.keys(d).some(function(k){return d[k][d[k].length-1]==false})){
                bad = true
            }
            svg.append('rect').attr('id','viz_plan_step_'+i).attr('class','plan_rect').attr('x',0).attr('y',50*i).attr('width',w).attr('height',40)
                .attr('fill',function(){if(bad) return highlight_color; else return neutral_color})
                .attr('stroke',function(){if(bad) return '#ffa188'; else return 'none'})

            if(i==0){
                text='Initial state'; 
            }
            else if(i==action_stack.length+1){
                text='Goal state'
            }
            else text= action_stack[i-1]
            svg.append('text')
                .attr("y", 25+50*i )
                .attr("x", w/2)
                .attr("dy", "0.1em")
                .attr('font-size','12')
                .attr('fill','#000')
                .style("text-anchor", "middle")
                .text(text);
        })

    })
    
}







////////////////////////////////////////////////////////////////////
// FOR ABSTRACTION
///////////////////////////////////////////////////////////////////
var selected_step = 0;
sprite_size = 20
var packing_data = null;
var node=null;
link = null;
var g_g_data;

cur_state_data = []
cur_flow_data = []
movable_objects = ['truck1','truck2','airplane1','airplane2','package1']
//simulating the work of an animation profile
ap_sim={
    'cities' : ['city1','city2'],
    'locations' : ['location1','location2','location3','location4'],
    'edges' : [],
    'airplanes':['airplane1','airplane2'],
    'trucks':['truck1','truck2'],
    'objects':['package1']
}
icons = {
    'airplanes': '../static/Icons/flight.png',
    'trucks': '../static/Icons/truck.png',
    'objects': '../static/Icons/box-96.png'
}
blips = {
    'airplanes': true,
    'trucks': true,
    'objects': false
}
function refresh_movable_icons(){
    d3.keys(icons).forEach(function(d){
        icon = icons[d]
        ap_sim[d].forEach(function(d2){
            item = d3.select('#'+d2).attr('opacity',1).attr('class','movable') 
            add_icon(item, icon, blips[d])
        })
    })
}

default_opacity = 0.8

abstraction_setup();

function abstraction_setup(board=svg){//}, item, parent, count, i, draw =true, color = '#ffffff',  label = false, margin = 0.1){
    svg.selectAll('*').remove()
    //adding next/prev rects
    create_svg_button(svg, 'next_btn', 40, 20, '>', 20, 20, next_step)
    create_svg_button(svg, 'prev_btn', 10, 20, '<', 20, 20, prev_step)

    svg.attr('viewBox', '0 0 ' + (w) + ' ' + (w-50))

    d3.keys(ap_sim).forEach(function (k){
        board.append('g').attr('id',k+'_set').selectAll('g').data(ap_sim[k]).enter()
            .append('g').attr('id',function(d){return d}).attr('class', k).attr("occupied",0)
    })

    refresh_movable_icons()

    function bilink(root) {
        // const map = new Map(root.leaves().map(function(d){console.log(d); return [d.data.name, d]}));
        const map = new Map(root.leaves().map(d => [d.data.name, d]));
        for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
        // for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
    
        return root;
    }
    
    colorin = "#00f"
    colorout = "#f00"
    colornone = "#555"

    width = w*0.95
    radius = width / 2

    line = d3.lineRadial()
        .curve(d3.curveBundle.beta(0.85))
        .radius(d => d.y)
        .angle(d => d.x)
    
    tree = d3.cluster()
        .size([2 * Math.PI, radius - 100]);

    d3.json(window.location.href+"/../hierarchy/").then( function(data){
        packing_data = data;
        console.log(packing_data)
        const root = tree(bilink(d3.hierarchy(data)
            .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

        node = board.append("g").attr('id','hier_nodes').attr('transform',`translate(${w/2},${w/2-50})`)
    

        node.attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .selectAll("g")
            .data(root.leaves())
            .enter()
            .append("g")
            .attr('id',function(d){ return 'node_'+d.data.name})
            // .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        
        const link = board.select("#edges_set")
            .attr('transform',`translate(${w/2},${w/2 -50})`)
            .attr("stroke", colornone)
            .attr("fill", "none")
            .selectAll("path")
            .data(root.leaves().flatMap(leaf => leaf.outgoing))
            .join("path")
            .attr('id',function(d){ return d[0].data.name +'-'+d[1].data.name})
            .attr('check',function([i,o]){
                // console.log(i,o);
                // console.log(i.path(o));
                pts = line(i.path(o)).split('L')
                start = pts[0].split('M')[1].split(',');
                end = pts[pts.length-1].split(',');
                screenstart = [+start[0]+w/2,+start[1]+w/2 -50];
                screenend = [+end[0]+w/2,+end[1]+w/2 -50];
                d3.select(this).attr('start',screenstart);
                d3.select(this).attr('end',screenend);
                point =  d3.select('#node_'+i.data.name);
                point.attr('loc',screenstart).attr('loc',function(d){d['loc'] = screenstart; return screenstart});
                // console.log(point.attr('loc'))
            })
            .attr('opacity',default_opacity)
            .style("mix-blend-mode", "multiply")
            .attr("d", ([i, o]) => line(i.path(o)))
            .each(function(d) { d.path = this; });
        
        //Adding circles for the nodes
        ap_sim["locations"].forEach(function(loc_name){
            r = 30
            h_parent = 2*r
            w_parent = 2*r
            draw=true
            color='#bbbbbb'

            container = board.select('#'+loc_name);
            hier_node = d3.select('#node_'+loc_name)
            loc = null
            hier_node.attr('loc',function(d){loc = d.loc; return d.loc;})

            x=loc[0];
            y=loc[1]+15;

            container.attr('x',x-1.5*r).attr('y',y-1.5*r).attr('width', w_parent -r/2).attr('height', h_parent-r/2);
    
            datum = [{"x":x,"y":y,"w_parent":w_parent,"h_parent":h_parent,"color":color}];
            if(draw==true){
                sel = container.selectAll("circle").data(datum); 
                sel.enter().append('circle').attr('cx',x).attr('cy',y)
                    .attr('r', r)
                    .attr('fill', color)
                    .on('mouseover',function(){tooltip_in(loc_name)})
                    .on('mousemove',function(){tooltip_in(loc_name)})
                    .on('mouseout', tooltip_out)

                //mel: add labels for locations
                sel.enter().append("text").attr("x",x-15).attr("y",y+40).text("loc "+loc_name.slice(-1)).attr("font-family","Arial")

                //for highlight circle
                container.append('circle').attr('class','highlight').attr('id',loc_name+'_hl').attr('cx',x).attr('cy',y)
                    .attr('r', r)
                    .attr('fill', 'red')
                    .attr('visibility','hidden')
            }
        })

        data["children"].forEach(function(cit){
            //since top level children are cities.
            container = board.select('#'+cit.name)
            circles = []
            if(cit.children){
                cit.children.forEach(function(loc){
                    c = board.select('#'+loc.name).select('circle');
                    circles.push({'r': +c.attr('r'),'x': +c.attr('cx'),'y': +c.attr('cy')});
                })
                enc_c = d3.packEnclose(circles);
                console.log(enc_c)
                //#mel: make cities circle bigger
                container.append('circle').attr('r',enc_c.r*1.15).attr('cx',enc_c.x).attr('cy',enc_c.y).attr('fill','#cccccc')
                    .on('mouseover',function(){tooltip_in(cit.name)})
                    .on('mousemove',function(){tooltip_in(cit.name)})
                    .on('mouseout', tooltip_out)

                container.append("text").attr('x',enc_c.x).attr('y',enc_c.y-80).text(cit.name).attr("font-family","Helvetica")
                //for highlight circle
                container.append('circle').attr('class','highlight').attr('id',cit.name+'_hl').attr('cx',enc_c.x+30).attr('cy',enc_c.y)
                    .attr('r', enc_c.r*1.15)
                    .attr('fill', 'red')
                    .attr('visibility','hidden')
            }
        })
            
    });
    
}

function add_icon(item, icon, blip = false, x=100, y=100){
    

    item.attr('x',x).attr('y',y).attr('xlink:href', icon).attr("count",0)
        .attr('width',sprite_size).attr('height',sprite_size);
    //for highlight circle
    item.append('circle').attr('class','highlight').attr('id',item.attr('id')+'_hl')
        .attr('cx',sprite_size/2).attr('cy',sprite_size/2)
        .attr('r', sprite_size/2)
        .attr('fill', 'red')
        .attr('visibility','hidden')
    sel = item.append("image").attr("id",function(d){return item.attr('id')+"_img"})
        .attr('width', sprite_size).attr('height', sprite_size)
        .attr("xlink:href", item.attr('xlink:href'))
        .attr('tooltip_text',"")
    
    sel.attr('title',item.attr('id')).on("mouseover",function(d){
            prnt = item.attr('id') + d3.select(this).attr('tooltip_text');;
            return tooltip_in(prnt)})
        .on('mouseout',tooltip_out)
        .on('click',function(d){
            // if(data!=null){
            //     printing = item.attr('id')+'\ncontains: '+item.attr('contains');
            //     // data['contains'].forEach(function(d){ printing+=d + ', '})
            //     printing+='\nparent: '+ data['parent'];
            //     console.log(printing)
            //     tooltip_in(printing)
            // }
        })
    // console.log(item)
    name = item.attr('id')+'_blip';
    var radius = 6
    if(blip==true){
        item.append('circle')
            .attr('id',name)
            .attr('cx',function() { return + radius-2;})
            .attr('cy',function() {return - radius+ 2})
            .attr('r',radius)
            // .attr('fill','none')
            .attr("fill",'#eeaabb')
            .attr("stroke",'#eeaabb')
            .attr('stroke-width',2)
            .attr('html','0');
        item.append('text').text(item.attr('count')).attr('class','blip_text')
            .attr("font-size", radius*2 + "px");
    }
    move_item(item, x, y)
}

function load_contents(obj, contents, time=500){
    obj.attr("count", +obj.attr('count')+1);
    obj.selectAll('.blip_text').text(obj.attr('count'));
    x = obj.attr('x');
    y = obj.attr('y')
    // console.log("here")
    contents.attr('temp_parent', obj.attr('id'))
        .attr('opacity',0).attr('visibility',"hidden")
    move_item(contents, x, y, duration = time, switch_opacity = true)
}
function unload_contents(obj, contents, x, y, time=500){
    //obj is the container, contents are the package etc, x and y are new coordintes
    obj.attr("count", Math.max(+obj.attr('count')-1,0));
    obj.selectAll('.blip_text').text(obj.attr('count'));
    x_obj = obj.attr('x');
    y_obj = obj.attr('y');
    move_item(contents, x, y, 0)
    contents.attr('temp_parent', obj.attr('id'))
        .attr('opacity',1).attr('visibility',"visible")
    move_item(contents, x, y, time)
}
//all transformations are wrt to the top left (0,0). Even during creation. The object is created at (0,0) and then moved to x,y degined in the group element.
function move_item(item, x, y, duration = 500, switch_opacity = false){
    //switch opacity: when needing to move first and switch opacity during the move

    item.attr('x',x)
        .attr('y',y)
        .transition()
        .duration(duration)
        .attr('transform',"translate(" + x + ", " + y + ")")
        // .transition()
        // // .attr('opacity', function(){
        // //     if(switch_opacity){
        // //         return 0;
        // //     }
        // //     else{
        // //         return item.attr('opacity')
        // //     }
        // // })

    return 0;
}
function move_item_path(item, x, y, path = '', duration = 500, switch_opacity = false){
    // console.log(path)
    // item.attr('contains')
    p = path.attr('start')
    // console.log(p)
    console.log(x,y)
    item.attr('x',x)
        .attr('y',y)
    // item.select('image')
        .transition().duration(duration*0.2).attr('transform',"translate("+p+ ")")
        .transition()
        .duration(duration*0.6)
        .attrTween("transform", translateAlong(path.node()))
        .ease(d3.easeLinear)
        .transition().duration(duration*0.2).attr('transform',"translate(" + x + ", " + y + ")")
        .attr('opacity', function(){
            if(switch_opacity){
                return 0;
            }
            else{
                return item.attr('opacity')
            }
        });
    return 0;
}

//https://bl.ocks.org/kafunk/68a7574a4041924bb7a3663608408685
function translateAlong(path) {
    var l = path.getTotalLength();
    console.log(l)
    return function(d, i, a) {
      return function(t) {
            var p = path.getPointAtLength(t * l);
            // console.log(p)
        return "translate(" + (+p.x+w/2) + "," + (+p.y+w/2-50) + ")";
              }
    }
  }

function occupy(parent, item, time = 'none', direction = ['top','right'], overflow = true){
    //direction: [starting location, heading]
    var offsetx = 0;
    var dirx = 0;
    var offsety = 0
    var diry = 0
    var rowx = 0;
    var rowy = 0;
    if(direction[0]=='top') { offsety = 20; diry = 1; }
    if(direction[0]=='bottom') { offsety = parent.attr('height')-20-sprite_size; diry = -1}
    if(direction[0]=='left') { offsetx = 20; dirx = 1}
    if(direction[0]=='right') { offsetx = parent.attr('width')-20-sprite_size; dirx = -1}
    //move dirx and diry down ?
    if(direction[1]=='right') {offsetx = 20; dirx = 1; rowx = 0; rowy = 1;}
    if(direction[1]=='left') {offsetx = parent.attr('width')-20-sprite_size; dirx = -1;rowx = 0; rowy = 1;}
    if(direction[1]=='up') {offsety = parent.attr('height')-20-sprite_size; diry = -1;rowx = 1; rowy = 0;}
    if(direction[1]=='down') {offsety = 20; diry = 1;rowx = 1; rowy = 0;}
    if(overflow==true){
        if(rowy==1){overflow = Math.floor(parent.attr('width')/sprite_size)}
        if(rowx==1){overflow = Math.floor(parent.attr('height')/sprite_size)}
    }
    else{
        overflow = 1000000;
    }
    old_parent = item.attr('parent')
    new_parent = parent.attr('id')
    item.attr('parent',parent.attr('id'))
    x = +parent.attr('x') + offsetx;
    y = +parent.attr('y') + offsety;
    // console.log('x',x,'y',y)
    occ = +parent.attr('occupied');
    if(rowx == 0){
        x = x + dirx*(occ%overflow)*sprite_size;
        y = y + diry*(Math.floor(occ/overflow))*sprite_size;
    }
    if(rowy == 0){
        y = y + diry*(occ%overflow)*sprite_size;
        x = x + dirx*(Math.floor(occ/overflow))*sprite_size;
    }
    //Add condition for row spillover
    parent.attr('occupied', +parent.attr('occupied') + 1);

    if(time == 'none'){
        move_item(item, x, y);
    }
    else if(movable_objects.includes(new_parent)){
        load_contents(d3.select('#'+new_parent), item, time)
    }
    else if(movable_objects.includes(old_parent)){
        unload_contents(d3.select('#'+old_parent), item, x, y, time)
    }
    else{
        move_item(item, x, y, time);
    }
}

function occupy_new(parent, item, time = 'none', direction = ['top','right'], overflow = true){
    //direction: [starting location, heading]
    old_parent = item.attr('parent')
    new_parent = parent.attr('id')
    item.attr('parent',new_parent)
    // console.log(old_parent, new_parent)
    // if(old_parent==new_parent){

    //     // occupy(parent, item, time, direction, overflow);
    //     // return
    // }
    var offsetx = 0;
    var dirx = 0;
    var offsety = 0
    var diry = 0
    var rowx = 0;
    var rowy = 0;
    if(direction[0]=='top') { offsety = 20; diry = 1; }
    if(direction[0]=='bottom') { offsety = parent.attr('height')-20-sprite_size; diry = -1}
    if(direction[0]=='left') { offsetx = 20; dirx = 1}
    if(direction[0]=='right') { offsetx = parent.attr('width')-20-sprite_size; dirx = -1}
    //move dirx and diry down ?
    if(direction[1]=='right') {offsetx = 20; dirx = 1; rowx = 0; rowy = 1;}
    if(direction[1]=='left') {offsetx = parent.attr('width')-20-sprite_size; dirx = -1;rowx = 0; rowy = 1;}
    if(direction[1]=='up') {offsety = parent.attr('height')-20-sprite_size; diry = -1;rowx = 1; rowy = 0;}
    if(direction[1]=='down') {offsety = 20; diry = 1;rowx = 1; rowy = 0;}
    if(overflow==true){
        if(rowy==1){overflow = Math.floor(parent.attr('width')/sprite_size)}
        if(rowx==1){overflow = Math.floor(parent.attr('height')/sprite_size)}
    }
    else{
        overflow = 1000000;
    }
    
    path = d3.select('#'+old_parent + '-' + parent.attr('id'))


    x = +parent.attr('x') + offsetx;
    y = +parent.attr('y') + offsety;
    occ = +parent.attr('occupied');
    if(rowx == 0){
        x = x + dirx*(occ%overflow)*sprite_size;
        y = y + diry*(Math.floor(occ/overflow))*sprite_size;
    }
    if(rowy == 0){
        y = y + diry*(occ%overflow)*sprite_size;
        x = x + dirx*(Math.floor(occ/overflow))*sprite_size;
    }
    //Add condition for row spillover
    parent.attr('occupied', +parent.attr('occupied') + 1);
    occ = +parent.attr('occupied');
    if(old_parent==new_parent){
        if(item.attr('temp_parent')!=null){
            move_item(item, x, y);
            item.attr('temp_parent',null)
        }
        if(item.attr('x')!=x || item.attr('y')!=y){
            move_item(item, x, y)
        }
    }

    
    //Clicking on plan steps not working correctly as of now. Fix.

    else if(movable_objects.includes(new_parent)){
        load_contents(d3.select('#'+new_parent), item)
    }
    else if(movable_objects.includes(old_parent)){
        unload_contents(d3.select('#'+old_parent), item, x, y)
    }
    else{
        if(time == 'none'){ 
            move_item_path(item, x, y, path);
        }
        else{
            move_item_path(item, x, y, path, time);
        }
    }
}


////////////////////////////////////////////////////
//HOUSEKEEPING FUNCTIONS
///////////////////////////////////////////////////
function create_svg_button(board, id, x, y, text, width = 20, height=20, onlick=()=>{return null}){
    g = board.append('g').attr('id',id+'_g').on('click', onlick)
    g.append('rect').attr('id',id).attr('class','svg_button')
        .attr('width',width).attr('height',height)
        .attr('fill',function(){ return '#cccccc'})
        .attr('stroke',function(){return 'none'})
    g.append('text')
        .attr("y", height/2)
        .attr("x", width/2)
        .attr("dy", "0.3em")
        .attr('font-size','12')
        .attr('fill','#000')
        .style("text-anchor", "middle")
        .text(text);
    g.attr('transform',"translate(" + x + ", " + y + ")")
}

function next_step(){
    if(selected_step<state_data.length-1){
        selected_step = selected_step+1;
        d3.selectAll('.plan_rect').attr('stroke','none')
        d3.select('#viz_plan_step_'+selected_step).attr('stroke','black')
        update_world_path(selected_step);
    }
}
function prev_step(){
    if(selected_step>0){
        console.log('here')
        selected_step = selected_step-1;
        d3.selectAll('.plan_rect').attr('stroke','none')
        d3.select('#viz_plan_step_'+selected_step).attr('stroke','black')
        update_world_path(selected_step);
    }
}
function select_step(i){
    //highlight correct box
    selected_step = i
    d3.selectAll('.plan_rect').attr('stroke','#777777')
    d3.select('#viz_plan_step_'+i).attr('stroke','black')
    update_world_immediate(selected_step)
}

function update_world_immediate(step){
    svg.selectAll('g').attr('occupied',0)
    svg.selectAll('g').attr('count',0)
    svg.selectAll('.blip_text').text('0')
    //for goal state: to show only relevant objects
    d3.selectAll('.movable').attr('opacity',0)
    highlight_wrong_preds(step)
    cur_state_data[step]["in"].forEach(function(arr){
        if(movable_objects.includes(arr[0])){
            d3.select('#'+arr[0]).attr('opacity',1)
            occupy(d3.select('#'+arr[1]), d3.select('#'+arr[0]), 50)
        }
    })
}
function update_world_path(step){
    svg.selectAll('g').attr('occupied',0)

    //for goal state: to show only relevant objects
    d3.selectAll('.movable').attr('opacity',0)
    highlight_wrong_preds(step)
    cur_state_data[step]["in"].forEach(function(arr){
        if(movable_objects.includes(arr[0])){
            d3.select('#'+arr[0]).attr('opacity',1)
            occupy_new(d3.select('#'+arr[1]), d3.select('#'+arr[0]))
        }
    })
}

function highlight_wrong_preds(i){
    d = cur_flow_data[i]
    
    console.log('Highlights: ',d)
    d3.selectAll('.highlight').attr('visibility','hidden').on('mouseover',function(){tooltip_in(d3.select(this).attr('id'))})
    d3.keys(d).forEach(function(k){
        if(d[k][d[k].length-1]==false){
            k2 = k.replaceAll('\'','\"')
            preds = JSON.parse(k2)
            for(iter=1;iter<preds.length;iter++){
                intro = "Missing precondition:\n"
                if(i==0) intro="Wrong predicate:\n"
                if(i==cur_flow_data.length-1) intro = "Missing goal:\n" 
                tooltip_text =  '\n'+ intro + preds[0] +'(' + preds.slice(1,preds.length)+')' 
                d3.select('#'+preds[iter]+'_hl').attr('visibility','visible')
                .attr('tooltip_text', tooltip_text)
                    .on('mouseover',
                    function(){
                        text =d3.select(this).attr('id').slice(0,-3) +  d3.select(this).attr('tooltip_text')
                        tooltip_in(text)}
                        )
                d3.select("#"+preds[iter]).attr('tooltip_text', tooltip_text)
                    .on("mouseover",function(d){
                    prnt = d3.select(this).attr('id') + d3.select(this).attr('tooltip_text');
                    return tooltip_in(prnt)})
            }

        }
    })

}
/////////////////////////////////////////////////
////////////For the combined viz
/////////////////////////////////////////////////
function test_plan_viz(){
    d3.select('#viz_modal_size').attr('class',"modal-dialog modal-dialog-centered modal-lg")
    sel = d3.select('#plan_preview_list').selectAll('li');
    // print(sel)
    plan_data = []
    sel.each(function(){
        item = d3.select(this);
        a = [item.html().split('(')[0]].concat(item.data()[0])
        // plan_data.push(item.html().split(')')[0])
        plan_data.push(a)
    })
    action_stack = []
    sel._groups[0].forEach(function(d){
        action_stack.push(d.innerHTML.split('<span')[0])
    })
    print(action_stack)
    print(plan_data)
    offset = 50
    d3.json(window.location.href+'/../test/'+ JSON.stringify(plan_data)).then(function(data){
        svg.attr('viewBox', '0 0 ' + (w*2) + ' ' + (Math.max(50 + 70*data[0].length + offset, w)))
        svg.append('text')
            .attr('x', 20)
            .attr('y', 380)
            .attr("font-size", "11px")
            .text(function(d) {
                return "* If it appears that the visualization has not loaded properly, reload the page"
            });
        flow_data = data[1];
        cur_flow_data = flow_data;
        svg.selectAll('.flow_g').remove();
        flow_g = svg.append('g').attr('class','flow_g')
        console.log(flow_data)
        flow_data.forEach(function(d, i){
            let neutral_color = '#cccccc'
            let highlight_color = '#ffaaaa'
            // console.log(d)
            bad = false
            if(d3.keys(d).some(function(k){return d[k][d[k].length-1]==false})){
                bad = true
            }
            if(i==0){
                text='Initial state'; 
            }
            else if(i==action_stack.length+1){
                console.log('Goal State:', bad)
                text='Goal state'
            }
            else text= action_stack[i-1]
            d3.keys(d).forEach(function(k, i2){
                bad2 = d[k][d[k].length -1]

                fill= "hsl(" + Math.random() * 360 + ",100%,50%)";
                fill= '#cccccc'

                //Main flow
                flow_g.append('rect').attr('x',w + 10+20*i2).attr('y',-15+offset+70*i).attr('width',10).attr('height','20')
                    .attr('fill',function(){if(bad2==true) return fill; else return highlight_color})
                    .attr('stroke',function(){if(bad2==true) return "none"; else return '#000000'})
                    .attr('stroke-width',function(){if(bad2==true) return 0; else return 1})
                    .attr("stroke-dasharray", "5,2")
                    .attr('bad',bad2)
                    .attr('class','flow flow_'+i)
                    .on('mouseover', function(){
                        intro = "";
                        console.log(d3.select(this).attr('bad'))
                        if(d3.select(this).attr('bad')!="true"){
                            intro = "Missing precondition:\n"
                            if(i==0) intro="Wrong predicate:\n"
                            if(i==flow_data.length-1) intro = "Missing goal:\n" 
                        }
                        k1 = JSON.parse(k.replaceAll('\'','\"'))
                        tooltip_in(intro+k1[0]+'('+k1.slice(1,k1.length)+')')
                    })
                    .on('mouseout', function(){
                        tooltip_out()
                        // d3.selectAll('.flow').attr('visibility','visible')
                        // d3.selectAll('.flow_hist').attr('visibility','hidden')
                    })
            })

            // create_svg_button(svg, 'viz_plan_step_'+i, (w/2)*(i%2) + w*0.01, w-100 + 50*Math.floor(i/2), i+'. '+text, w/2.1, 48 )
            flow_g.append('rect').attr('id','viz_plan_step_'+i).attr('class','plan_rect').attr('x',w).attr('y',offset+ 70*i).attr('width',w).attr('height',45)
                .attr('fill',function(){if(bad) return highlight_color; else return neutral_color})
                .attr('stroke',"#777777")
                .attr('stroke-dasharray', function(){if(bad) return "5,2"; else return "1,0"})
                .on('click', function(){select_step(i)})
            flow_g.append('text')
                .attr("y", offset+25+ 70*i)
                .attr("x", w + w/2)
                .attr("dy", "0.1em")
                .attr('font-size','12')
                .attr('fill','#000')
                .style("text-anchor", "middle")
                .text(text)
                .on('click', function(){select_step(i)});
        })

        state_data = data[0];
        cur_state_data = state_data;

        movable_objects.forEach(function(d){
            d3.select('#'+d).selectAll('*').remove();
        })
        
        refresh_movable_icons();

        svg.selectAll('g').attr('occupied',0)

        hl_fill='#ff7777'
        svg.selectAll('.highlight')
            .attr('fill', hl_fill)
            .attr('stroke','black')
            .attr('stroke-width','1')
            .attr('stroke-dasharray',"5,2")
        selected_step = 0;
        
        // console.log(state_data[0])
        select_step(selected_step)
    })
}



//Everything is inside the get_info d3.json call
})

/*
//KNOWN BUGS:

    Entities inside other entities will not render correctly on initial state of abstraction

*/