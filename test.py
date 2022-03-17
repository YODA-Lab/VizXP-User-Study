#PDDL parser from: https://github.com/pucrs-automated-planning/pddl-parser

import copy
import PDDL
import pprint
from classes import Object, Action, State, Explanation, Problem   
import json     
import sys
#See library pddlpy

#Create class for model. (Robot/user)
"""Problem and domain definition"""

domain = 'custom_logistics/agent.pddl'

problem = 'custom_logistics/prob1.pddl'
solution_file = 'custom_logistics/plan.txt'

problems = []
problems.append(Problem(domain, problem, solution_file))

# print(problems[0].plan)
#use objects in the problem?

"""Functions to state at steps"""
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
    return plan.current_state#, 0# act_list[step-1]

step = 6
print(get_state(step).variables)

#Create a list of all grounded states.
states=[]
for i in range( len(problems[0].plan) + 1):
    states.append(get_state(i).variables)

pp = pprint.PrettyPrinter(indent=4)
# pp.pprint(states)
# pp.pprint(get_state(2).variables)
pprint.pprint(states)

def get_precondition_flow(step, user=0):
    act_list = problems[user].plan
    [action, parameters] = act_list[step-1]  #using step-1 because first state is initial state, so action (step-1) will happen after state (step)
    grounded_action = action.ground(parameters)
    # print(action.name)
    print(action.name,parameters)
    print(grounded_action)
    flows={}
    for pre in grounded_action["preconditions"]:
        pred = pre[0]
        objs = pre[1:]
        flow=[]
        for i in range(step):
            flow.append(objs in states[i][pred])
        flows[str(pre)] = flow
    return flows

def get_goal_state_flow():
    goal_preconditions = []
    for k,v in problems[0].goal_state.variables.items():
        for preds in v:
            a = [k]
            a.extend(preds)
            goal_preconditions.append(a)
    flows={}
    for pre in goal_preconditions:
        pred = pre[0]
        objs = pre[1:]
        flow=[]
        for i in range(len(states)):
            flow.append(objs in states[i][pred])
        flows[str(pre)] = flow
    return flows



print('Goal')
print(problems[0].goal_state.variables)
print(get_goal_state_flow())
exit()

hierarchy = {"name":"root","children":[]}
processed_items = {obj[0]:{'parent':None,'children':set()} for obj in states[0]['location']}
# print(processed_items)
for obj in states[0]['location']:
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
                p2[k]['value'] = 60

                imports = []
                p = processed_items[v["parent"]]["children"]
                imports.extend(p)
                if k in imports:
                    imports.remove(k)
                if [k] in states[0]["airport"]:
                    imports.extend([obj[0] for obj in states[0]["airport"]])
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
print(hierarchy)