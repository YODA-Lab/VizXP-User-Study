
## What is Planning?
#### Thinking before acting!

Classical planning is the task of coming up with a sequence of actions that will achieve a particular goal. Within the realm of AI, planning is mostly concerned with developing "agents" that can come up with such actions on their own.

In particular, a planning problem consists of an initial state (where we start in the environment), a goal state (where we want to go in the environment), and a set of actions that we can execute to transistion between states in the environment. The available set of actions are specific to each planning problem and are described in the *Domain* of the planning problem.

A solution to a planning problem, called a *plan*, is a sequence of actions, which when executed would allow us to transition from the initial states to the goal states. The cost of a plan is measured by its plan length, which is the number of actions it contains. The shortest plan (cost-minimal) for a given problem is called an *optimal* plan.


## Components of a Planning Task.
Suppose we have a planning problem which involves telling a robot to pick up a box from a table. We will use this example to describe the components of a planning task:

- **Objects**: Things in the world that interest us, e.g, *box B*, *table T*, *robot R*
- **Predicates**: Properties of objects that we are interested in; Can be *True* or *False*. 
        For example, *ontable(B, T)* could tell us that box *B* is on table *T*, and *free( R)* could tell us the robots hand is free 
- **Initial states**: The states of the world that we start in. If initially the box is on the table and the robot's hand is free, the initial state can be represented as a combination of *ontable(B, T)* and *free( R)*.
- **Goal states**: The states of the world that we want to reach. In the example, the goal state can be *holding(B, R)*. In other words, the box should be in the robot's hand after the plan is executed. 
- **Actions**: Ways of changing the state of the world. An action *Pick-up(B, T, R)* may be used to say that we want the robot *R* to pick up box *B* from table *T*.
    Each action comprises of the following conditions:
    	i) **Precondtions**: States that have to be *True* in order to exectute the action. For *Pick-up(B,T,R)*, the box *B* should be on the table *T*, and the robot's hand should be free. Hence, this action will have the preconditions *ontable(B, T)* and *free( R)*. Since these conditions are satisfied in the initial state, this action is possible.
    	ii) **Addition effects**: States that become *True* after we execute the action. For *Pick-up(B,T,R)*, the action will result in *holding(B, R)* being *True* after the action is completed.
    	iii) **Deletion effects**: States that become *False* after we execute the action. For *Pick-up(B,T,R)*, *ontable(B, T)* and *free( R)* will be *False* after the action is completed.

Then, the **plan** for this problem would be just one step long: *P* = \{ *Pick-up(B, T, R)* \}. The reason is that, the initial state satisfies the preconditions of action *Pick-up(B, T, R)*, thus allowing us to execute it. After executing *Pick-up(B, T, R)*, we end up at the state, *holding(B, R)*, which is the goal state.

In other more complicated problems, the plan may involve multiple steps, each acting upon the state after the previous action, to cumulatively result in the goal.



