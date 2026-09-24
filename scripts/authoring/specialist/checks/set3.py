"""Independent checks for Specialist practice set 3 (sympy + scipy)."""
from sympy import *
from scipy import stats
from scipy import integrate as si
from scipy.optimize import brentq
import math

x, y, t, z, k, s, u = symbols('x y t z k s u')
N = stats.norm

print('== Exam 1 ==')
assert all(math.factorial(n) > 2**n for n in range(4, 30)) and math.factorial(3) < 8
# Q2 circle |z-(1+i)| = sqrt2
print('Q2 origin on circle', abs(0 - (1 + I)) == sqrt(2), 'max |z|', 2*sqrt(2))
# Q3 f = 2 asin(1-x)
f = 2*asin(1 - x); print('Q3 domain', solve([1 - x >= -1, 1 - x <= 1], x), "f'", simplify(diff(f, x)), "f'(1/2)", simplify(diff(f, x).subs(x, Rational(1, 2))))
# Q4 surface area y = 2 sqrt x, 0..3, about x-axis
yy = 2*sqrt(x); SA = integrate(2*pi*yy*sqrt(1 + diff(yy, x)**2), (x, 0, 3)); print('Q4', simplify(SA))
# Q5
print('Q5', integrate(sin(x)**2*cos(x)**3, (x, 0, pi/2)))
# Q6 balloon
r = 5; drdt = 10/(4*math.pi*r**2); print('Q6 dS/dt', 8*math.pi*r*drdt)
# Q7 Euler dy/dx = x/y, y(0)=2
y1 = 2 + 0.5*0/2; y2 = y1 + 0.5*(0.5/y1); print('Q7', y1, y2, 'exact', math.sqrt(5))
# Q8
print('Q8 se', 2/4, 'CI', 12.5 - 1.96*0.5, 12.5 + 1.96*0.5, 'n (z=2, width<=1)', (2*2*2/1)**2)
# Q9 planes
n1, n2 = Matrix([1, 1, 1]), Matrix([1, -1, 2]); d = n1.cross(n2); print('Q9 dir', d.T, 'point', solve([x + y - 6, x - y - 5], [x, y]), 'cos', n1.dot(n2)/(sqrt(3)*sqrt(6)))
# Q10
rv = Matrix([t**2 - 1, t**3 - 3*t]); vv = rv.diff(t); print('Q10 v', vv.T, 'j-zero', solve(vv[1], t), 'pos t=1', rv.subs(t, 1).T, 'r(0),r(2)', rv.subs(t, 0).T, rv.subs(t, 2).T, 'a(1)', vv.diff(t).subs(t, 1).T)
X, Y = symbols('X Y'); print('   cartesian check', simplify((Y**2 - (X + 1)*(X - 2)**2).subs({X: t**2 - 1, Y: t**3 - 3*t})))

print('== Section A ==')
print('A3', apart((3*x + 5)/(x + 1)**2, x))
print('A4', div(2*x**3 - x + 1, x**2 + 1, x))
print('A5', simplify((1 + I)**8/(1 - I)**4))
print('A6 roots', solve(z**2 - 2*cos(k)*z + 1, z))
# A8 while loop
xx, yv = 1.0, 2.0
while xx < 2 - 1e-12:
    yv = yv + 0.25*(yv/xx); xx += 0.25
print('A8', yv)
print('A10 distance', integrate(Abs(4 - 2*t), (t, 0, 5)), 'displacement', integrate(4 - 2*t, (t, 0, 5)))
print('A11', solve(36 - 4*x**2, x))
print('A12', simplify(integrate(sin(x)/(1 + cos(x)), (x, 0, pi/3))))
print('A13', integrate(sin(y), (y, 0, pi/2)))
a_ = Matrix([1, 2, -2]); b_ = Matrix([2, -1, 2]); print('A15', a_.dot(b_)/sqrt(b_.dot(b_)))
print('A17', sqrt(Matrix([1, 1, 0]).cross(Matrix([0, 1, 2])).dot(Matrix([1, 1, 0]).cross(Matrix([0, 1, 2])))))
dvec = Matrix([2, 1, -1]); print('A18', [Matrix(nv).dot(dvec) for nv in ([1, -1, 1], [1, 1, 1], [2, 1, -1], [1, -2, 1])], 'point in 1st plane?', 1 - 0 + 2)

print('== Section B ==')
a = 2
L = si.quad(lambda s_: 3*a*abs(math.sin(s_)*math.cos(s_)), 0, 2*math.pi)[0]
A = 4*si.quad(lambda x_: (a**(2/3) - x_**(2/3))**1.5, 0, a)[0]
SAx = 2*si.quad(lambda s_: 2*math.pi*(a*math.sin(s_)**3)*3*a*math.sin(s_)*math.cos(s_), 0, math.pi/2)[0]
print('B1 length', L, 'area', A, 3*math.pi/2, 'SA about x (whole)', SAx, 48*math.pi/5)
tt = symbols('tt'); print('   dy/dx', simplify(diff(2*sin(tt)**3, tt)/diff(2*cos(tt)**3, tt)), 'point t=pi/4', (2*math.cos(math.pi/4)**3, 2*math.sin(math.pi/4)**3))
# B2
print('B2 intersection', solve([(x - 2)**2 + x**2 - 4], [x]), 'area', pi + 2, float(pi + 2))
print('   cube roots of 2+2i', [simplify(sqrt(2)*exp(I*(pi/12 + 2*q*pi/3))) for q in range(3)], abs(2 + 2*I)**Rational(1, 3))
# B3 mixing
Q = t*(t + 50)/(t + 25); print('B3 verify', simplify(diff(Q, t) - (2 - Q/(25 + t))), 'Q(25)', Q.subs(t, 25))
te = brentq(lambda s_: s_*(s_ + 50)/((s_ + 25)*(50 + 2*s_)) - 0.3, 0.1, 25); print('   conc 0.3 at', te)
print('   Q after', '37.5 e^{-0.02(t-25)}', 'time to 10 kg', 25 + math.log(3.75)/0.02)
# B4 boat
print('B4 t to 2', (1/2 - 0.1)/0.05, 'x to 2', 20*math.log(5))
t_stop = si.quad(lambda w: 1/(0.5 + 0.05*w*w), 0, 10)[0]; x_stop = si.quad(lambda w: w/(0.5 + 0.05*w*w), 0, 10)[0]; print('   model2 t', t_stop, 'x', x_stop, 10*math.log(11))
# B5 pyramid
O = Matrix([0, 0, 0]); A_ = Matrix([4, 0, 0]); B_ = Matrix([4, 4, 0]); C_ = Matrix([0, 4, 0]); V = Matrix([2, 2, 6])
nAB = (A_ - V).cross(B_ - V); nBC = (B_ - V).cross(C_ - V); print('B5 n_VAB', nAB.T, 'n_VBC', nBC.T, 'plane d', Matrix([3, 0, 1]).dot(A_))
print('   angle with base', math.degrees(math.acos(1/math.sqrt(10))), 'dist O', 12/math.sqrt(10), 'vol', Rational(1, 3)*16*6, 'angle faces', math.degrees(math.acos(1/10)))
# B6
se = 30/6; print('B6 p', N.cdf((490 - 500)/se), 'crit', 500 - N.ppf(0.95)*se, 'typeII', 1 - N.cdf(500 - N.ppf(0.95)*se, 488, se))
zz = N.ppf(0.95); print('   n', (2*zz*30/12)**2, 'CI', 490 - N.ppf(0.975)*se, 490 + N.ppf(0.975)*se)
