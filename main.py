## Author: Ashwin Kumar
from flask import Flask, request
import json
import sys
import time
from classes import Explanation, Problem

"""""""""""""""""""""""""""""""""""""""""""""""
    PLANNING BACKEND FUNCTIONS
"""""""""""""""""""""""""""""""""""""""""""""""

#Functions to get state at steps
def get_state(step, user=0):
    act_list = problems[user].plan
    i_state = problems[user].initial_state
    if step==-1 or step>len(act_list):
        step = len(act_list)
    plan = Explanation(i_state, act_list)
    i=0
    bad_acts = []
    while i<step:
        bad_acts.append([act_list[i][0].name, act_list[i][1], plan.take_step()])
        i+=1
    # print(bad_acts)
    return plan.current_state

#Function to get precondition flow for a particular step
def get_precondition_flow(step, user=0):
    act_list = problems[user].plan
    if step==0:
        return {}
    [action, parameters] = act_list[step-1]  #using step-1 because first state is initial state, so action (step-1) will happen after state (step)
    grounded_action = action.ground(parameters)
    print(action.name)
    flows={}
    for pre in grounded_action["preconditions"]:
        pred = pre[0]
        objs = pre[1:]
        flow=[]
        for i in range(step):
            #if agent, make false the ones changed in domain/prob

            if domain == 'custom_logistics/agent2.pddl' and user==1 and  pred=='is-hub':
                print(pred, objs, pred=="is-hub")
                flow.append(objs not in states_list[user][i][pred])
                print(flow)
            else:
                flow.append(objs in states_list[user][i][pred])

        flows[str(pre)] = flow
    return flows

def get_goal_state_flow(user=0):
    goal_preconditions = []
    for k,v in problems[user].goal_state.variables.items():
        for preds in v:
            a = [k]
            a.extend(preds)
            goal_preconditions.append(a)
    flows={}
    for pre in goal_preconditions:
        pred = pre[0]
        objs = pre[1:]
        flow=[]
        for i in range(len(states_list[user])-1): #-1 for when states include goal state
            flow.append(objs in states_list[user][i][pred])
        flows[str(pre)] = flow
    return flows

def get_states(user = 0):
    act_list = problems[user].plan
    i_state = problems[user].initial_state
    step = len(act_list)
    plan = Explanation(i_state, act_list)
    i=0
    bad_acts = []
    t_states = []
    for i in range( len(problems[user].plan) + 1):
        t_states.append(get_state(i, user).variables)
    t_states.append(problems[user].goal_state.variables)
    # print(bad_acts)
    return t_states

def get_flows(user=0):
    t_flows=[]
    for i in range( len(problems[user].plan) + 1):
        t_flows.append(get_precondition_flow(i, user))
    t_flows.append(get_goal_state_flow(user))
    return t_flows


#user problem
scenario_num = 3
scenario = json.load(open('scenario'+str(scenario_num)+'.json','r'))
# viz_type = 'conductor'
# viz_type = 'abstraction'
# viz_type = 'text'
# viz_type = "viz"
# domain = 'custom_logistics/agent2.pddl'
# problem_file = 'custom_logistics/prob2.pddl'
viz_type = scenario["viz_type"]
domain = scenario["domain"]
problem_file = scenario["problem_file"]
solution_file = []
problem = Problem(domain, problem_file, solution_file)


text_explanation = {"wrong":[],"required":[]}
#Each item in the explanation is formatted as:
#  [ Action name or s/g state, list of ['pred name',[list of objects/parameters]]]
# Example- missing precondition in move airplane(airplane, src, dest) that source and destination should be hubs:
#       ['move-airplane',[['is-hub',[1]],['is-hub',[2]]]
# Or missing precondition that airplane should be in src
#       ['move-airplane',[['in',[0,1]]]
# Can also have names of objects instead of numbers, but would require different parsing
#
# For wrong information/information to be removed
if domain=='custom_logistics/agent2.pddl':
    text_explanation["required"].append(['move-airplane',[['is-hub',[1]],['is-hub',[2]]]])
if problem_file=='custom_logistics/prob2.pddl':
    text_explanation["wrong"].append(['Initial State',[['in',["package1","location1"]]]])
    text_explanation["required"].append(['Initial State',[['in',["package1","location3"]]]])

#Setting up correct problem
correct_domain = 'custom_logistics/agent.pddl'
correct_problem_file = 'custom_logistics/prob1.pddl'
correct_solution_file = 'custom_logistics/plan.txt'
correct_problem = Problem(correct_domain, correct_problem_file, correct_solution_file)

problems = [problem, correct_problem]

states= get_states(0)
correct_states = get_states(1)
states_list = [states, correct_states]

flows = get_flows(0)
correct_flows = get_flows(1)
# print(correct_flows)
flows_list = [flows, correct_flows]

solutions_list = [solution_file, correct_solution_file]

####FLASK CALLBACKS
app = Flask(__name__)
@app.route('/')
def landing():
    return app.send_static_file('landing.html')


@app.route('/handle_form/<s>')
def handle_form(s):
    data=json.loads(s)
    uid = data["uid"]
    data["viz_type"]=viz_type
    data["domain"] = domain == 'custom_logistics/agent.pddl'
    data["problem"] = problem_file == 'custom_logistics/prob1.pddl'
    data["start_time"] = time.time()

    json.dump( data, open( "Prolific/"+uid+".json", "w" ))
    return json.dumps("/"+uid+"/")


@app.route('/<u>/')
def start0(u):
    return app.send_static_file('0-intro.html')

@app.route('/<u>/1/')
def start(u):
    return app.send_static_file('1-planning.html')

@app.route('/<u>/2/')
def start2(u):
    return app.send_static_file('2-domain.html')

@app.route('/<u>/3/')
def start3(u):
    return app.send_static_file('3-Quiz.html')


@app.route('/<u>/4/')
def start4(u):
    return app.send_static_file('4-editor.html')

@app.route('/<u>/5/')
def start5(u):
    if viz_type=="abstraction":
        return app.send_static_file('5-abstraction.html')
    elif viz_type=="conductor":
        return app.send_static_file('5-conductor.html')
    elif viz_type=="viz":
        return app.send_static_file('5-viz.html')
    elif viz_type=="text":
        return app.send_static_file('5-text.html')

@app.route('/<u>/6/')
def start6(u):
    return app.send_static_file('problem.html')

@app.route('/<u>/editor')
def hello_world(u):
    return app.send_static_file('index.html')

@app.route('/<u>/planning_started')
def start_planning(u):
    u_data = json.load(open('Prolific/'+u+'.json','r'))
    u_data["planning_start"] = time.time()
    json.dump(u_data, open('Prolific/'+u+".json",'w'))

    a = {"viz_type":u_data["viz_type"]}
    a["domain"] = u_data["domain"]
    a["problem"] = u_data["problem"]

    return json.dumps(a)



@app.route('/<u>/check_plan/')
def check_plan(u):
    return app.send_static_file('explanation_intro.html')

@app.route('/<u>/get_info/')
def get_scenario_info(u):
    a = {"viz_type":viz_type}
    a["domain"] = domain == 'custom_logistics/agent.pddl'
    a["problem"] = problem_file == 'custom_logistics/prob1.pddl'

    # u_data = json.load(open('Prolific/'+u+'.json','r'))
    # a = {"viz_type":u_data["viz_type"]}
    # a["domain"] = u_data["domain"]
    # a["problem"] = u_data["problem"]
    # if "plan_creation" in u_data.keys():
    #     a["plan_created"] = u_data["plan_creation"]
    return json.dumps(a)

@app.route("/<u>/submit/<s>")
def post(u,s):
    global problems, states_list, flows_list, solution_file

    # print(s)
    s = json.loads(s)
    # print(s[0])

    solution_file = s
    solutions_list[0] = s

    u_data = json.load(open('Prolific/'+u+'.json','r'))
    u_data["user_plan"] = s
    u_data["planning_end"] = time.time()
    u_data["planning_time"] = u_data["planning_end"]-u_data["planning_start"]
    json.dump(u_data, open('Prolific/'+u+".json",'w'))

    #First recheck variables to see if plan is correct in user domain
    user = 0
    problems[0] = Problem(domain, problem_file, solution_file)

    #Getting all states grounded
    t_states=get_states(0)
    states_list[user] = t_states

    t_flows=[]
    # if len(problem.plan):
    for i in range( len(problems[user].plan) + 1):
        t_flows.append(get_precondition_flow(i, user))
    t_flows.append(get_goal_state_flow(user))
    print("FLOWS")
    print(t_flows)
    flows_list[user] = t_flows

    u_data["plan_creation"] = True
    #check if plan is wrong
    for flow in flows_list[0]:
        for v in flow.values():
            if not v[-1]:
                u_data["plan_creation"] = False
                json.dump(u_data, open('Prolific/'+u+".json",'w'))
                return json.dumps('/'+u+'/feedback')

    json.dump(u_data, open('Prolific/'+u+".json",'w'))



    ##Then store the correct domain info. (Is this needed?)
    user = 0
    problems[0] = Problem(correct_domain, problem_file, solution_file)

    #Getting all states grounded
    t_states=get_states(0)
    states_list[user] = t_states

    t_flows=[]
    # if len(problem.plan):
    for i in range( len(problems[user].plan) + 1):
        t_flows.append(get_precondition_flow(i, user))
    t_flows.append(get_goal_state_flow(user))
    print("FLOWS")
    print(t_flows)
    flows_list[user] = t_flows

    return json.dumps('/'+u+'/check_plan')


@app.route('/<u>/explanation')
def explanation(u):
    return app.send_static_file('explanation.html')

@app.route('/<u>/explanation_started')
def start_explanation(u):
    #For some reason, hello_world isn't called everytime you go to that page (probably broswser caching)
    u_data = json.load(open('Prolific/'+u+'.json','r'))
    u_data["explanation_start"] = time.time()
    json.dump(u_data, open('Prolific/'+u+".json",'w'))

    a = {"viz_type":u_data["viz_type"]}
    a["domain"] = u_data["domain"]
    a["problem"] = u_data["problem"]

    return json.dumps(a)

@app.route('/<u>/explanation_ended/<s>')
def end_explanation(u,s):
    data=json.loads(s)
    print(data)
    #For some reason, hello_world isn't called everytime you go to that page (probably browser caching)
    u_data = json.load(open('Prolific/'+u+'.json','r'))
    u_data["explanation_end"] = time.time()
    # if u_data["plan_creation"]==True:
    u_data["explanation_answers"] = data
    u_data['explanation_time'] = u_data["explanation_end"] -u_data["explanation_start"]
    json.dump(u_data, open('Prolific/'+u+".json",'w'))
    return json.dumps("/"+u+"/correction_intro")

@app.route('/<u>/correction_intro')
def correction_intro(u):
    return app.send_static_file('correction_intro.html')

@app.route('/<u>/correction')
def correction(u):
    return app.send_static_file('correction.html')

@app.route('/<u>/correction_started')
def start_correction(u):
    #For some reason, hello_world isn't called everytime you go to that page (probably broswser caching)
    u_data = json.load(open('Prolific/'+u+'.json','r'))
    u_data["correction_start"] = time.time()
    json.dump(u_data, open('Prolific/'+u+".json",'w'))

    a = {"viz_type":u_data["viz_type"]}
    a["domain"] = u_data["domain"]
    a["problem"] = u_data["problem"]
    a["plan"] = u_data["user_plan"]

    return json.dumps(a)

@app.route("/<u>/submit_correct/<s>")
def end_correction(u,s):
    global problems, states_list, flows_list, solution_file

    s = json.loads(s)
    solution_file = s
    solutions_list[0] = s

    u_data = json.load(open('Prolific/'+u+'.json','r'))
    u_data["user_plan_corrected"] = s
    u_data["correction_end"] = time.time()
    u_data['correction_time'] = u_data["correction_end"] -u_data["correction_start"]
    json.dump(u_data, open('Prolific/'+u+".json",'w'))

    user = 0
    problems[0] = Problem(correct_domain, correct_problem_file, solution_file)

    #Getting all states grounded
    t_states=get_states(0)
    states_list[user] = t_states

    t_flows=[]
    # if len(problem.plan):
    for i in range( len(problems[user].plan) + 1):
        t_flows.append(get_precondition_flow(i, user))
    t_flows.append(get_goal_state_flow(user))
    print("FLOWS")
    print(t_flows)
    flows_list[user] = t_flows

    #check if plan is wrong
    for flow in flows_list[0]:
        for v in flow.values():
            if not v[-1]:
                u_data["plan_corrected"] = False
                json.dump(u_data, open('Prolific/'+u+".json",'w'))
                return json.dumps('/'+u+'/feedback')

    u_data["plan_corrected"] = True
    json.dump(u_data, open('Prolific/'+u+".json",'w'))
    return json.dumps("/"+u+"/feedback")


@app.route('/<u>/feedback')
def feedback(u):
    return app.send_static_file('feedback.html')

@app.route('/<u>/feedback_ended/<s>')
def end_feedback(u,s):
    data=json.loads(s)
    u_data = json.load(open('Prolific/'+u+'.json','r'))
    u_data["feedback_answers"] = data
    json.dump(u_data, open('Prolific/'+u+".json",'w'))
    return json.dumps("/"+u+"/study_end")

@app.route('/<u>/study_end')
def study_end(u):
    return app.send_static_file('study_end.html')

@app.route('/<u>/store_end_time')
def store_end_time(u):
    u_data = json.load(open('Prolific/'+u+'.json','r'))
    u_data["end_time"] = time.time()
    u_data["total_time"] = u_data["end_time"] - u_data["start_time"]
    json.dump(u_data, open('Prolific/'+u+".json",'w'))
    a = {'creation':u_data["plan_creation"], 'correction':u_data["plan_corrected"]}
    return json.dumps(a)

####################################################
"""Visualization in Modal"""
###################################################


@app.route('/<u>/test/<s>')
def test(u, s):
    s = json.loads(s)
    user = 0

    global problems, states_list, flows_list
    if user==0:
        #Setting up problem
        solution_file = s
        problems[0] = Problem(domain, problem_file, solution_file)

    #Getting all states grounded
    t_states=get_states(0)
    states_list[user] = t_states

    t_flows=[]
    # if len(problem.plan):
    for i in range( len(problems[user].plan) + 1):
        t_flows.append(get_precondition_flow(i, user))
    t_flows.append(get_goal_state_flow(user))
    print("FLOWS")
    print(t_flows)
    flows_list[user] = t_flows
    return json.dumps([t_states,t_flows])

@app.route('/<u>/test_correct/<s>')
def test_correct(u, s):
    s = json.loads(s)
    user = 0

    global problems, states_list, flows_list
    if user==0:
        #Setting up problem
        solution_file = s
        problems[0] = Problem(correct_domain, correct_problem_file, solution_file)

    #Getting all states grounded
    t_states=get_states(0)
    states_list[user] = t_states

    t_flows=[]
    # if len(problem.plan):
    for i in range( len(problems[user].plan) + 1):
        t_flows.append(get_precondition_flow(i, user))
    t_flows.append(get_goal_state_flow(user))
    print("FLOWS")
    print(t_flows)
    flows_list[user] = t_flows
    return json.dumps([t_states,t_flows])


@app.route('/<u>/hierarchy/')
def get_hierarchy(u):
    global states, states_list
    states = states_list[0]

    hierarchy = {"name":"root","children":[]}
    hierarchy["children"].append({"name":"non", "value":1, "imports":[]}) #For sizing circles in viz
    processed_items = {obj[0]:{'parent':None,'children':set()} for obj in states[0]['is-location']}
    # print(processed_items)
    for obj in states[0]['is-location']:
        obj = obj[0]
        # processed_items[obj]={'parent':None,'children':[]}
        for child,parent in states[0]['in']:
            if parent in processed_items.keys() and child in processed_items.keys():
                processed_items[parent]['children'].add(child)
                processed_items[child]['parent']=parent
    for k,v in processed_items.items():
        v['children'] = list(v['children'])

    p2={}
    p_list = []
    for k,v in processed_items.items():
        def process_item(k):
            if k not in p_list:
                p_list.append(k)
                v = processed_items[k]
                p2[k]={"name":k}
                children = v['children']
                if len(children) == 0:
                    p2[k]['value'] = 70

                    imports = []
                    p = processed_items[v["parent"]]["children"]
                    imports.extend(p)
                    if k in imports:
                        imports.remove(k)
                    # """
                    #for fully connected
                    if domain == 'custom_logistics/agent2.pddl':
                        if k in ["location1","location2","location3","location4"]:
                            imports.extend(["location1","location2","location3","location4"])
                            imports.remove(k)

                    #for airports
                    if domain == 'custom_logistics/agent.pddl':
                        if [k] in states[0]["is-hub"]:
                            imports.extend([obj[0] for obj in states[0]["is-hub"]])
                            imports.remove(k)
                    #"""
                    p2[k]["imports"] = imports
                else:
                    p2[k]["children"] = []
                    for i in children:
                        b = process_item(i)
                        p2[k]["children"].append(b)

                if v["parent"]==None:
                    hierarchy["children"].append(p2[k])
            return p2[k]
        process_item(k)
    return json.dumps(hierarchy)

@app.route('/<u>/hierarchy_exp/')
def get_hierarchy_exp(u):
    global states, states_list
    states = states_list[0]

    hierarchy = {"name":"root","children":[]}
    hierarchy["children"].append({"name":"non", "value":1, "imports":[]}) #For sizing circles in viz
    processed_items = {obj[0]:{'parent':None,'children':set()} for obj in states[0]['is-location']}
    # print(processed_items)
    for obj in states[0]['is-location']:
        obj = obj[0]
        # processed_items[obj]={'parent':None,'children':[]}
        for child,parent in states[0]['in']:
            if parent in processed_items.keys() and child in processed_items.keys():
                processed_items[parent]['children'].add(child)
                processed_items[child]['parent']=parent
    for k,v in processed_items.items():
        v['children'] = list(v['children'])

    p2={}
    p_list = []
    for k,v in processed_items.items():
        def process_item(k):
            if k not in p_list:
                p_list.append(k)
                v = processed_items[k]
                p2[k]={"name":k}
                children = v['children']
                if len(children) == 0:
                    p2[k]['value'] = 70

                    imports = []
                    p = processed_items[v["parent"]]["children"]
                    imports.extend(p)
                    if k in imports:
                        imports.remove(k)

                    #for airports
                    if [k] in states[0]["is-hub"]:
                        imports.extend([obj[0] for obj in states[0]["is-hub"]])
                        imports.remove(k)

                    p2[k]["imports"] = imports
                else:
                    p2[k]["children"] = []
                    for i in children:
                        b = process_item(i)
                        p2[k]["children"].append(b)

                if v["parent"]==None:
                    hierarchy["children"].append(p2[k])
            return p2[k]
        process_item(k)
    return json.dumps(hierarchy)

##Explanation
@app.route('/<u>/flow_state/<user>')
def explain(u, user):
    user = int(user)
    global problems, states_list, flows_list, solutions_list
    solution = solutions_list[user]
    if user==0:
        u_data = json.load(open('Prolific/'+u+'.json','r'))
        solution = u_data["user_plan"]
    if type(solution)==str:
        plan = []
        with open(solution) as answers:
            for line in answers:
                l = line.split('(')[1].split(')')[0]
                a = l.split()
                plan.append(a)
        solution = plan
    action_stack = solution
    print(solution)
    print('--------------------------')
    i_g_state = [[True],[True]]
    if user==0:
        user_problem = Problem(correct_domain, problem_file, solution)
        #Getting all states grounded
        problems[0] = user_problem
        t_states=get_states(0)
        states_list[user] = t_states

        t_flows=[]
        for i in range( len(problems[user].plan) + 1):
            t_flows.append(get_precondition_flow(i, user))
        t_flows.append(get_goal_state_flow(user))
        flows_list[user] = t_flows

        u_vars = user_problem.initial_state.variables
        a_vars = problems[1].initial_state.variables
        if u_vars!= a_vars:
            #For user
            ini_diff = []
            for k in u_vars.keys():
                for v in u_vars[k]:
                    if v not in a_vars[k]:
                        ini_diff.append([k]+v)
            print(ini_diff)
            i_g_state[0] = [False, ini_diff]
            for wrong in ini_diff:
                flows_list[0][0][str(wrong)] = [False]

            #for agent
            ini_diff = []
            for k in a_vars.keys():
                for v in a_vars[k]:
                    if v not in u_vars[k]:
                        ini_diff.append([k]+v)
            print(ini_diff)
            i_g_state[0] = [False, ini_diff]
            for wrong in ini_diff:
                flows_list[1][0][str(wrong)] = [False]

        u_vars = user_problem.goal_state.variables
        a_vars = problems[1].goal_state.variables
        if u_vars!= a_vars:
            g_diff = []
            for k in a_vars.keys():
                for v in a_vars[k]:
                    if v not in u_vars[k]:
                        g+_diff.append([k]+v)
            print(g_diff)
            i_g_state[1] = [False, g_diff]
            for wrong in g_diff:
                flows_list[0][-1][str(wrong)] = [False]
                flows_list[1][-1][str(wrong)] = [False]


    return json.dumps([states_list[user],flows_list[user], action_stack, i_g_state])



##Explanation
@app.route('/<u>/explanation_flow/<user>')
def explanation_flow(u, user):
    user = int(user)
    global problems, states_list, flows_list, solutions_list, text_explanation
    solution = solutions_list[user]
    if user==0:
        u_data = json.load(open('Prolific/'+u+'.json','r'))
        solution = u_data["user_plan"]
    if type(solution)==str:
        plan = []
        with open(solution) as answers:
            for line in answers:
                l = line.split('(')[1].split(')')[0]
                a = l.split()
                plan.append(a)
        solution = plan
    action_stack = solution
    print(solution)
    print('--------------------------')

    if user==0:
        user_problem = Problem(domain, problem_file, solution)
        #Getting all states grounded
        problems[0] = user_problem
        t_states=get_states(0)
        states_list[user] = t_states

        t_flows=[]
        for i in range( len(problems[user].plan) + 1):
            t_flows.append(get_precondition_flow(i, user))
        t_flows.append(get_goal_state_flow(user))
        flows_list[user] = t_flows
    # DO NOT USE THE OTHER EXPLANATION FUNCTION AS THAT OVERWRITES THE FLOWS_LIST
    #Also doesnt work if the flow is not followed. Needs a hard reload otherwise..
    exp_flows = flows_list[user]
    print('ExP FLWOS', exp_flows)
    for i,act in enumerate(action_stack):
        for exp in text_explanation["required"]:
            if act[0]==exp[0]:  #if action name matches
                for exp_part in exp[1]: #for all changes to that action
                    params = []
                    for param_inds in exp_part[1]:
                        if type(param_inds)==int:
                            params.append(act[param_inds+1])
                        else:
                            params.append(param_inds)
                    prec = [exp_part[0]] + params
                    #For required preconditions, need to add to flow, but only if state is not true.
                    if str(prec) not in exp_flows[i+1].keys():
                        if params not in states_list[user][i][exp_part[0]]:  #Need to check in state as well (or only in state?).
                            exp_flows[i+1][str(prec)] = ["required/missing" for _ in range(i+1)]
                        else:
                            exp_flows[i+1][str(prec)] = ["unknown" for _ in range(i)]+["required/present"]

    for i,act in enumerate(action_stack):
        for exp in text_explanation["wrong"]:
            if act[0]==exp[0]:  #if action name matches
                for exp_part in exp[1]: #for all changes to that action
                    params = []  #replacing placeholders with actual parameters
                    for param_inds in exp_part[1]:
                        if type(param_inds)==int:
                            params.append(act[param_inds+1])
                        else:
                            params.append(param_inds)
                    prec = [exp_part[0]] + params
                    if str(prec) in exp_flows[i+1].keys():
                        exp_flows[i+1][str(prec)][-1]="wrong"

    #Embedding the states for the correct domain and problem
    user_problem = Problem(correct_domain, correct_problem_file, solution)
    #Getting all states grounded
    problems[0] = user_problem
    t_states=get_states(0)
    states_list[user] = t_states

    #For initial and goal state
    i_g_state_required = [[True],[True]]
    i_g_state_wrong = [[True],[True]]

    print("explanation", text_explanation)
    for exp in text_explanation["required"]:
        if exp[0]=="Initial State":
            for exp_part in exp[1]:
                i_g_state_required[0]= [False, [exp_part[0]] + exp_part[1] ]
                exp_flows[0][str([exp_part[0]] + exp_part[1])]=["required/missing"]

    for exp in text_explanation["wrong"]:
        if exp[0]=="Initial State":
            for exp_part in exp[1]:
                i_g_state_wrong[0]= [False, [exp_part[0]] + exp_part[1] ]
                #only for current case. ppackage1_wrong is the second drawn package
                exp_part[1][0] = "package1_"
                states_list[user][0][exp_part[0]].append(exp_part[1])
                print(states_list[user][0][exp_part[0]])
                exp_flows[0][str([exp_part[0]] + exp_part[1])]=["wrong"]

    for exp in text_explanation["required"]:
        if exp[0]=="Goal State":
            for exp_part in exp[1]:
                i_g_state_required[1]= [False, [exp_part[0]] + exp_part[1] ]
                exp_flows[-1][str([exp_part[0]] + exp_part[1])]=["required/missing" for _ in range(len(action_stack)+1)]

    for exp in text_explanation["wrong"]:
        if exp[0]=="Goal State":
            for exp_part in exp[1]:
                i_g_state_wrong[1]= [False, [exp_part[0]] + exp_part[1] ]
                exp_flows[-1][str([exp_part[0]] + exp_part[1])][-1]="wrong"


    a = {"states" : states_list[user], "flows":exp_flows, "action_stack":action_stack, "i_g_state":{"required":i_g_state_required, "wrong": i_g_state_wrong}}

    return json.dumps(a)

if __name__ == '__main__':
    if len(sys.argv)==2:
	    app.run(debug = True, port = int(sys.argv[1]))
    else:
        app.run(debug = True)