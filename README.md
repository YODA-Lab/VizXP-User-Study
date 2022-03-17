This repository contains the code for a prototype implementation for VizXP [link]() and the associated user study, as described in the paper.
The results for the user study as well as supplementary material are also included in this repository.
(**VizXP: A Visualization Framework for Conveying Explanations to Users in Model Reconciliation Problems**)

# Usage
To run this locally, use `python main.py (port)`, with an optional port argument (default=5000). Then, visit http://127.0.0.1:(port)/ on your browser to run the user study. 
### Requirements 
1. Python 3.7.4
2. Flask 1.1.1
An internet connection is also required to load the libraries used to display the front end.

# VizXP
The prototype implementation has the following components:
- Plan editor to allow people to create plans from a set of actions
- Explanation Visualizer to show errors in plan
The goal of the user study was to see if users performed better when using VizXP for explanations as opposed to text based explanations. 

## Types of visualizations:
1. Action Space (Predicate flows)
2. State Space (Container Abstraction)

## Acknowledgements
PDDL parser from https://github.com/pucrs-automated-planning/pddl-parser was used to parse pddl inputs for the domain and problem files, and all classes in `classes.py` are built off this parsed input.

This work was done at Washington University in St Louis (2020-2021).