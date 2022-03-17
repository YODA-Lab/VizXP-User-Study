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

d3.json(window.location.href+'/../correction_started').then(function(preload_data){
    viz_type = preload_data.viz_type;
    if(viz_type=='conductor'){
        d3.select('#menu_viz').select('iframe')
            .attr('src','../static/conductor_tutorial.html')
            .attr('height','700')
    }
    else if(viz_type=='viz'){
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
        d3.selectAll('#problem_change').html("location1")
    }
    if(preload_data.domain==false){
        exp_txt = "Required precondition for move-airplane: is-hub(source-location) \nRequired precondition for move-airplane: is-hub(destination-location)"
    }
    else if(preload_data.problem==false){
        exp_txt = 'Wrong initial state: in(package1, location1)\nRequired initial state: in(package1,location3)'
    }
    d3.select('#exp_area').append('p').html(exp_txt).style("white-space","pre-wrap")
// d3.select("#action_select").append('option').attr('value','Test value').html('Test Value')
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
// document.getElementById('refresh').addEventListener('click', test)

// document.getElementById('test_button').addEventListener('click', test)

function test(){
    // if(viz_type == "text")
    //     test_plan_text();
    // else if(viz_type == "viz")
    //     test_plan_viz();
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
    sel.append('span').attr('class','edit').html('<i class="material-icons">mode_edit</i>').on('click', edit_action)


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

preload_data["plan"].forEach(function(d){
    action_name = d[0];
    action_parameters = d.slice(1,d.length)
    add_action_auto(action_name, action_parameters)
})
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
    d3.json(window.location.href+'/../submit_correct/'+ JSON.stringify(plan_data)

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////EXPLANATION VIZ///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

w =400
h=600
user_svg = d3.select('#exp_viz')
if(viz_type=='viz'){
user_svg.attr('x',0)
    .attr('y',0)
    .attr('width', '100%')
    // .attr('height', h)
    .attr('viewBox', '0 0 ' + (w) + ' ' + (h))
    // .style("margin-left","30px")
    .style("margin-top","2%")
    .style('background',"#eeeeee")
    .attr('index',0)
    d3.select('#exp_area').append('code').html("Reload the page if the visualization does not render properly").style("white-space","pre-wrap")
}
agent_svg = 7;

boards = [user_svg]

////////////////////////////////////////////////////////////////////

// FOR ABSTRACTION
var selected_step = [0,0];
sprite_size = 20
var packing_data = null;
var node=null;
link = null;
var g_g_data;

user_svg.append('g').attr('id','flow_g')
// agent_svg.append('g').attr('id','flow_g')

cur_state_data = [[],[]]
cur_flow_data = [[],[]]
movable_objects = ['truck1','truck2','airplane1','airplane2','package1', 'package1_']
//simulating the work of an animation profile
ap_sim={
    'cities' : ['city1','city2'],
    'locations' : ['location1','location2','location3','location4'],
    'edges' : [],
    'airplanes':['airplane1','airplane2'],
    'trucks':['truck1','truck2'],
    'objects':['package1','package1_']
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
function refresh_movable_icons(board){
    d3.keys(icons).forEach(function(d){
        icon = icons[d]
        ap_sim[d].forEach(function(d2){
            item = board.select('#'+d2).attr('opacity',1).attr('class','movable') 
            console.log(d2)
            add_icon(item, icon, blips[d])
        })
    })
}

default_opacity = 0.8


function abstraction_setup(board=user_svg){//}, item, parent, count, i, draw =true, color = '#ffffff',  label = false, margin = 0.1){
    board.selectAll('*').remove()
    //adding next/prev rects
    create_svg_button(board, 'next_btn', 40, 20, '>', 20, 20, next_step)
    create_svg_button(board, 'prev_btn', 10, 20, '<', 20, 20, prev_step)

    board.attr('viewBox', '0 0 ' + (w) + ' ' + (w-50))

    d3.keys(ap_sim).forEach(function (k){
        board.append('g').attr('id',k+'_set').selectAll('g').data(ap_sim[k]).enter()
            .append('g').attr('id',function(d){return d}).attr('class', k).attr("occupied",0)
    })

    refresh_movable_icons(board)

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
    hier_src = window.location.href+"/../hierarchy_exp/"
    // if(board==user_svg) hier_src = window.location.href+"/../hierarchy/"
    d3.json(hier_src).then( function(data){
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
                point =  board.select('#node_'+i.data.name);
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
            hier_node = board.select('#node_'+loc_name)
            loc = null
            hier_node.attr('loc',function(d){loc = d.loc; return d.loc;})

            x=loc[0];
            y=loc[1];

            container.attr('x',x-1.5*r).attr('y',y-1.5*r).attr('width', w_parent -r/2).attr('height', h_parent-r/2);
    
            datum = [{"x":x,"y":y,"w_parent":w_parent,"h_parent":h_parent,"color":color}];
            if(draw==true){
                sel = container.selectAll("circle").data(datum); 
                sel.enter().append('circle').attr('cx',x).attr('cy',y)
                    .attr('r', r)
                    .attr('fill', color)
                    .on('mouseover',function(){tooltip_in(loc_name)})
                    .on('mouseout', tooltip_out);
                
                //mel: add labels for locations
                sel.enter().append("text").attr("x",x-15).attr("y",y+40).text("loc "+loc_name.slice(-1)).attr("font-family","Arial")

                //for highlight circle
                hl_fill='#ffaaaa'
                if(board==agent_svg) hl_fill = '#aaffaa'
                container.append('circle').attr('class','highlight').attr('id',loc_name+'_hl').attr('cx',x).attr('cy',y)
                    .attr('r', r)
                    .attr('visibility','hidden')
                    // .on('mouseover',function(){tooltip_in(loc_name)})
                    // .on('mousemove',function(){tooltip_in(loc_name)})
                    .on('mouseout', tooltip_out);
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
                    .on('mouseout', tooltip_out);
                  
                container.append("text").attr('x',enc_c.x).attr('y',enc_c.y-80).text(cit.name).attr("font-family","Helvetica")
                //
                //for highlight circle
                hl_fill='red'
                if(board==agent_svg) hl_fill = '#aaffaa'
                container.append('circle').attr('class','highlight').attr('id',cit.name+'_hl').attr('cx',enc_c.x).attr('cy',enc_c.y)
                    .attr('r', enc_c.r*1.15)
                    .attr('fill', hl_fill)
                    .attr('visibility','hidden')
            }
        })
        
        // get_flow_and_states(board.attr('index'), board)
            
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
            prnt = item.attr('id') + d3.select(this).attr('tooltip_text');
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
    blip_color = "#ddeeff"
    if(blip==true){
        item.append('circle')
            .attr('id',name)
            .attr('cx',function() { return + radius-2;})
            .attr('cy',function() {return - radius+ 2})
            .attr('r',radius)
            // .attr('fill','none')
            .attr("fill",blip_color)
            .attr("stroke",blip_color)
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
        load_contents(board.select('#'+new_parent), item, time)
    }
    else if(movable_objects.includes(old_parent)){
        unload_contents(board.select('#'+old_parent), item, x, y, time)
    }
    else{
        move_item(item, x, y, time);
    }
}

function occupy_new(board, parent, item, time = 'none', direction = ['top','right'], overflow = true){
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
    
    path = board.select('#'+old_parent + '-' + parent.attr('id'))


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
        load_contents(board.select('#'+new_parent), item)
    }
    else if(movable_objects.includes(old_parent)){
        unload_contents(board.select('#'+old_parent), item, x, y)
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

//Update d3.select to board.select or d3.selectAll beloq this point
//Need to update the Selected step to reflect the two boards
//update cur_state_data and flow_data to read indexed

function next_step(){
    board = d3.select(this.parentNode)
    index = board.attr('index')
    step = selected_step[index]
    if(step<cur_state_data[index].length-1){
        selected_step[index] = selected_step[index]+1;
        step = selected_step[index];
        board.selectAll('.plan_rect').attr('stroke','none')
        board.select('#viz_plan_step_'+selected_step[index]).attr('stroke','black')
        update_world_path(board, selected_step[index], index);
    }
}
function prev_step(){
    board = d3.select(this.parentNode)
    index = board.attr('index')
    step = selected_step[index]
    if(step>0){
        selected_step[index] = selected_step[index]-1;
        step = selected_step[index];
        board.selectAll('.plan_rect').attr('stroke','none')
        board.select('#viz_plan_step_'+selected_step[index]).attr('stroke','black')
        update_world_path(board, selected_step[index], index);
    }
}

function select_step(i, index){
    //highlight correct box
    if(i==0){
        loop_timer_start()
        console.log("START")
    } 
    else{
        loop_timer_stop()
    }
    board = boards[index]
    selected_step[index] = i
    board = boards[index]
    board.selectAll('.plan_rect').attr('stroke','#777777')
    board.selectAll('.plan_rect').attr('stroke-width','1')
    board.select('#viz_plan_step_'+i).attr('stroke','black')
    board.select('#viz_plan_step_'+i).attr('stroke-width',"2")
    
    update_world_immediate(board, selected_step[index], index )
}

function update_world_immediate(board, step, index){
    board.selectAll('g').attr('occupied',0)
    board.selectAll('g').attr('count',0)
    board.selectAll('.blip_text').text('0')
    //for goal state: to show only relevant objects
    board.selectAll('.movable').attr('opacity',0)
    highlight_wrong_preds(board, step, index)
    cur_state_data[index][step]["in"].forEach(function(arr){
        // console.log(arr)
        if(movable_objects.includes(arr[0])){
            board.select('#'+arr[0]).attr('opacity',1)
            occupy(board.select('#'+arr[1]), board.select('#'+arr[0]), 50)
        }
    })
}
function update_world_path( board, step, index){
    board.selectAll('g').attr('occupied',0)

    //for goal state: to show only relevant objects
    board.selectAll('.movable').attr('opacity',0)
    highlight_wrong_preds(board, step , index)
    cur_state_data[index][step]["in"].forEach(function(arr){
        if(movable_objects.includes(arr[0])){
            board.select('#'+arr[0]).attr('opacity',1)
            occupy_new(board, board.select('#'+arr[1]), board.select('#'+arr[0]))
        }
    })
}

//for the various highlight colors:
cols = {
    "required/present":"#77bb88",
    "required/missing":"#eeeda1",
    "wrong": "#ff7756"
}
cols_txt ={
    "required/present":"Required and present",
    "required/missing":"Required, but missing",
    "wrong": "Wrong info, should be removed"    
}

function highlight_wrong_preds(board, step, index){
    d = cur_flow_data[index][step]
    console.log('Highlights: ',d)
    board.selectAll('.highlight').attr('visibility','hidden').on('mouseover',function(){tooltip_in(d3.select(this).attr('id'))})
    board.selectAll('*').attr('tooltip_text',"")


    d3.keys(d).forEach(function(k){
        if(d[k][d[k].length-1]!=true && d[k][d[k].length-1]!=false){
            b_txt = d[k][d[k].length-1];
            console.log('Okay check ',k, d[k])
            k2 = k.replaceAll('\'','\"')
            preds = JSON.parse(k2)
            for(iter=1;iter<preds.length;iter++){
                if(index==0){
                    intro = "<b>"+b_txt+"</b> precondition:\n"
                    if(step==0) intro="<b>"+b_txt+"</b> predicate:\n"
                    if(step==cur_flow_data[index].length-1) intro = "<b>"+b_txt+"</b> goal:\n" 
                }
                if(index==1){
                    intro = "Required precondition:\n"
                    if(step==0) intro="Correct predicate:\n"
                }
                tooltip_text =  '\n'+ intro + preds[0] +'(' + preds.slice(1,preds.length)+')'
                board.select('#'+preds[iter]+'_hl').attr('visibility','visible')
                .attr('fill', cols[d[k][d[k].length-1]])
                    .attr('tooltip_text', tooltip_text)
                    .on('mouseover',
                    function(){
                        text =d3.select(this).attr('id').slice(0,-3) +  d3.select(this).attr('tooltip_text')
                        // console.log(text)
                        tooltip_in(text)
                    })
                board.select("#"+preds[iter]).attr('tooltip_text', tooltip_text)
                    .on("mouseover",function(d){
                    prnt = d3.select(this).attr('id') + d3.select(this).attr('tooltip_text');
                    return tooltip_in(prnt)})
            }

        }
    })
}
// //////////////////////////////////////////////////
/////////////////////////Flow for combined viz:////////////////////////
function get_exp_flow_viz(boardindex=0, board){

    d3.json(window.location.href+'/../explanation_flow/'+ boardindex).then(function(data){
        console.log("DATA",data)
                
        offset = 50

        // d3.select('#viz_div').attr("class","col-sm-8")
        // d3.select('#exp_div').attr("class","col-sm-4")
        board.attr('viewBox', '0 0 ' + (w*2) + ' ' + (Math.max(offset + 50 + 70*data.states.length, w)))

        board.append('text')
            .attr('x', 20)
            .attr('y', 400)
            .attr("font-size", "11px")
            .text(function(d) {
                // return "* If it appears that the visualization has not loaded properly, reload the page"
            });

        //Adding legend
        
        var legend = board.selectAll('.legend')
        .data(d3.keys(cols))
        .enter()
        .append('g')
        .attr("transform","translate(20,300)")
        // .attr('class', 'legend').attr('visibility','hidden');

        legend.append('rect')
            .attr('x', 25)
            .attr('y', function(d, i) {
                return i * 20;
            })
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', function(d,i) {
                return cols[d];
            })
            .attr('stroke','black');

        legend.append('text')
            .attr('x', 37)
            .attr('y', function(d, i) {
                return (i * 20) + 9;
            })
            .attr("font-size", "12px")
            .text(function(d) {
                return cols_txt[d];
            });

        // console.log('i_g_state: ', data[3])
        // console.log('Solution: ', data[2])
        let action_stack = data.action_stack

        let flow_data = data.flows;
        cur_flow_data[boardindex] = flow_data;
        // board.select('.flow_g').remove();
        let flow_g = boards[boardindex].append('g').attr('class','flow_and_plan_g')

        console.log("Flow Data: ",flow_data)
        cur_flow_data[boardindex].forEach(function(d, i){
            let neutral_color = '#cccccc'
            let highlight_color = '#ffaaaa'
            if(boardindex==1) highlight_color = "#aaffaa"
            // console.log(d)
            bad = false
            console.log(boardindex)
            if(d3.keys(d).some(function(k){return d[k][d[k].length-1]!=true})){
                bad = true
            }
            if(i==0){
                text='Initial state'; 
            }
            else if(i==action_stack.length+1){
                console.log('Goal State:', bad)
                text='Goal state'
            }
            else{
                text= action_stack[i-1][0]+'('+action_stack[i-1].slice(1, action_stack[i-1].length) +')'
            }
            d3.keys(d).forEach(function(k, i2){
                bad2 = d[k][d[k].length -1]

                if (bad2==false) bad2=true

                fill= "hsl(" + Math.random() * 360 + ",100%,50%)";
                fill= '#cccccc'

                //Main flow
                flow_g.append('rect').attr('x',w + 10+20*i2).attr('y',-15+offset+70*i).attr('width',10).attr('height','20')
                    .attr('fill',function(){
                        if(bad2==true) return fill; 
                        else{
                            return cols[bad2]
                            // return highlight_color
                        } 
                    })
                    .attr('stroke',function(){if(bad2==true) return "none"; else return '#000000'})
                    .attr('stroke-width',function(){if(bad2==true) return 0; else return 1})
                    .attr("stroke-dasharray", "5,2")
                    .attr('bad',bad2)
                    .attr('class','flow flow_'+i)
                    .on('mouseover', function(){
                        intro = "";
                        console.log(d3.select(this).attr('bad'))
                        if(d3.select(this).attr('bad')!="true"){
                            if(boardindex==0){
                                b_txt = d3.select(this).attr('bad')
                                intro = "<b>"+b_txt+"</b> precondition:\n"
                                if(i==0) intro="<b>"+b_txt+"</b> predicate:\n"
                                if(i==cur_flow_data[boardindex].length-1) intro = "<b>"+b_txt+"</b> goal:\n" 
                            }
                            if(boardindex==1){
                                intro = "Required precondition:\n"
                                if(i==0) intro="Correct predicate:\n"
                            }
                        }
                        k1 = JSON.parse(k.replaceAll('\'','\"'))
                        tooltip_in(intro+k1[0]+'('+k1.slice(1,k1.length)+')')
                    })
                    .on('mouseout', function(){
                        tooltip_out()
                        // d3.selectAll('.flow').attr('visibility','visible')
                        // d3.selectAll('.flow_hist').attr('visibility','hidden')
                    })
                    .on('click', function(){select_step(i, boardindex)})
                })
            // create_svg_button(svg, 'viz_plan_step_'+i, (w/2)*(i%2) + w*0.01, w-100 + 50*Math.floor(i/2), i+'. '+text, w/2.1, 48 )
            flow_g.append('rect').attr('id','viz_plan_step_'+i).attr('class','plan_rect').attr('x',w).attr('y',offset+70*i+5).attr('width',w-5).attr('height',45)
                .attr('fill',function(){
                    // if(bad) return highlight_color; 
                    // else return neutral_color
                    return neutral_color
                })
                .attr('stroke',"#777777")
                .attr('stroke-dasharray', function(){
                    return "1,0"
                    if(bad) return "5,2"; 
                    else return "1,0"})
                .on('click', function(){select_step(i, boardindex)})
            flow_g.append('text')
                .attr("y", offset+25+ 70*i)
                .attr("x", w + w/2)
                .attr("dy", "0.1em")
                .attr('font-size','12')
                .attr('fill','#000')
                .style("text-anchor", "middle")
                .text(text)
                .on('click', function(){select_step(i, boardindex)});
            

        })
        // setup_intro();
        state_data = data.states;
        cur_state_data[boardindex] = state_data;

        movable_objects.forEach(function(d){
            board.select('#'+d).selectAll('*').remove();
        })
        
        refresh_movable_icons(board);

        board.selectAll('g').attr('occupied',0)

        hl_fill='#ff7777'
        if(board==agent_svg) hl_fill = '#aaffaa'
        board.selectAll('.highlight')
            .attr('fill', hl_fill)
            .attr('stroke','black')
            .attr('stroke-width','1')
            .attr('stroke-dasharray',"5,2")
        selected_step[boardindex] = 2;
        //Use occupy with time 0 to set objects at new location when loading or click
        //only use occupy new when moving the plan forward or backward one step.
        //REmove ability to move forward (or back) when plan step is invalid?
        
        // console.log(state_data[0])
        if(preload_data.problem==false){
            d3.select('#package1_img').attr('size_update',1)
            d3.select('#package1__img').attr('size_update',-1)
            

        }
        select_step( selected_step[boardindex], boardindex)

        //animation for the packages

    })
}

var loop_timer;
function loop_timer_start(){
    if(preload_data.problem==false){
        d3.select('#package1_img').attr('size_update',1)
        d3.select('#package1__img').attr('size_update',-1)        
        loop_timer= d3.interval(loop_func, 100);
    }
}
function loop_timer_stop(){
    d3.select('#package1_img').attr('size_update',0).attr('width',sprite_size)
    d3.select('#package1__img').attr('size_update',0).attr('width',sprite_size)
    
    if(preload_data.problem==false){
        loop_timer.stop()
    }
}
let loop_func = function (e) { 
    d3.select("#objects_set").selectAll('image').attr('width', function(d){
        a = d3.select(this)
        w = (0 + +a.attr('width') + +a.attr('size_update'))
        w=w%(sprite_size+1)
        if(w==-2) w=sprite_size-1
        return w
    }) 
} 
//////////////////////////////////////////////////////////////////////////

if(viz_type=='viz'){
    abstraction_setup(user_svg);
    get_exp_flow_viz(0, user_svg)
        //Adding the explanation text
    // if(preload_data.domain==false){
    //     exp_txt = "Required precondition for move-airplane: is-hub(source-location) \nRequired precondition for move-airplane: is-hub(destination-location)"
    // }
    // else if(preload_data.problem==false){
    //     exp_txt = 'Wrong initial state: in(package1, location1)\nRequired initial state: in(package1,location3)'
    // }
    // d3.select('#agent').append('p').html(exp_txt)
}
// elif (viz_type=='text'){
//     d3.select('#viz_text_remove_for_text').html()
// }

//Everything is inside the get_info d3.json call
})
