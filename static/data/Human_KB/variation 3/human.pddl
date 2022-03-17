(define (domain logistics-strips)
  (:requirements :strips) 
  (:predicates  
    (obj ?o)
  (truck ?t)
    (location ?l)
  (airplane ?a)
    (airport ?airport)
  (in ?o1 ?o2))

(:action l-truck
  :parameters
   (?o
    ?t
    ?l)
  :precondition
   (and (obj ?o) (truck ?t) (location ?l)
   (in ?t ?l) (in ?o ?l))
  :effect
   (and (in ?o ?t)))

(:action l-airplane
  :parameters
   (?o
    ?a
    ?l)
  :precondition
   (and (obj ?o) (airplane ?a) (location ?l)
   (in ?o ?l) (in ?a ?l))
  :effect
   (and (not (in ?o ?l)) ))

(:action u-truck
  :parameters
   (?o
    ?t
    ?l)
  :precondition
   (and (obj ?o) (truck ?t) (location ?l)
        (in ?t ?l) )
  :effect
   (and (not (in ?o ?t)) (in ?o ?l)))

(:action u-airplane
  :parameters
   (?o
    ?a
    ?l)
  :precondition
   (and (obj ?o) (airplane ?a) (location ?l)
        (in ?a ?l))
  :effect
   (and (not (in ?o ?a)) (in ?o ?l)))

(:action m-truck
  :parameters
   (?t
    ?l-from
    ?l-to
    ?l)
  :precondition
   (and (truck ?t) (location ?l-from) (location ?l-to) (location ?l)
   (in ?t ?l-from)
   (in ?l-to ?l))
  :effect
   (and (not (in ?t ?l-from)) (in ?t ?l-to)))

(:action m-airplane
  :parameters
   (?a
    ?l-from
    ?l-to)
  :precondition
   (and (airplane ?a) (airport ?l-to)
  (in ?a ?l-from))
  :effect
   (and (not (in ?a ?l-from)) (in ?a ?l-to)))
)
