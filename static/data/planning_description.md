# Classical Planning

## What is Classical Planning?
#### Thinking before acting!

	Classical planning is the task of coming up with a sequence of actions that will achieve a particular goal. Within the realm of AI, planning is mostly concerned with developing "agents" that can come up with such actions on their own.

	In particular, a planning problem consists of an initial state (where we start in the environment), a goal state (where we want to go in the environment), and a set of actions that we can execute to transistion between states in the environment. The available set of actions are specific to each planning problem and are described in the *Domain* of the planning problem. 
	A solution to a planning problem, called a *plan*, is a sequence of actions, which when executed would allow us to transition from the initial states to the goal states. The cost of a plan is measured by its plan length, which is the number of actions it contains. The shortest plan (cost-minimal) for a given problem is called an *optimal* plan.


## Example 

	Assume we have an action $Pickup$ with **precondition** $On\_table$, and **addition** and **deletion effects** $Holding$ and $Not_on\_table$, respectively. $On\_table, Holding$, and Not_on\_table$ are the **predicates** of the probelms, which are particular states in the environment. The problem requires you to pickup block $A$ from the table. As such, we have one **object** $A$, one **initial state** $On\_table(A)$ and one **goal state** $Holding(A)$. 

	Then, the **plan** for this problem would be: $\pi = \{ Pickup(A) \}$. The reason is that, the state ($On\_table$) is True (as it is the initial state), which satisfies the precondition of action $Pickup(A)$, and thus allowing us to execute it. After executing $Pickup(A)$, we end up at two states, $Holding(A)$ (goal state) and $Not\_on\_table(A)$.

## Components of Classical Planning Task.

	To give you a more thorough description, a classical planning task consists of the following components:

		-- Objects: Things in the world that interest us. 
 	 	-- Predicates: Properties of objects that we are interested in; Can be *True* or *False*.
		-- Initial states: The states of the world that we start in.
		-- Goal states: The states of the world that we want to reach.
		-- Actions: Ways of changing the state of the world.

			- In addition, each action comprises of the following conditions:
				i) Precondtions: States that have to be *True* in order to exectute the action.
				ii) Addition effects: States that become *True* after we execute the action.
				iii) Deletion effects: States that become *False* after we execute the action.
	
	





