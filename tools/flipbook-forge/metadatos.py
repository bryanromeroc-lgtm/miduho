# Metadatos revisados a mano para los libros de la corrida final.
# titulo/autor/editorial/edad/resumen/creditos: lo que no está, sale del libro.json.
CD = "Claudia Patricia Bautista Arias"
CD_CRED = "Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores"
CD_ED = "Ministerio de Cultura · Universidad Nacional"
CEIBA_A = "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García"
CEIBA_C = "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García - Ilustraciones: Amalia Satizábal"
LEMC = "Ministerio de Cultura · Leer es mi cuento"
ICBF = "ICBF · Fundalectura"

def cuento(n, titulo, resumen):
    return dict(titulo=titulo, autor=CD, editorial=CD_ED, edad="6-8", creditos=CD_CRED, resumen=resumen)

M = {
 "descubre-imagina-crea-molas": dict(autor="Maguaré", editorial="Maguaré · Ministerio de Culturas", edad="6-8",
   creditos="Maguaré - Estrategia Digital de Cultura y Primera Infancia, Ministerio de Cultura"),
 "cuento-12-derecho-al-juego-y-al-arte": cuento(12, "Cuento 12: Derecho al juego y al arte",
   "Manolo es el único niño de una colonia de galápagos ancianos que solo comen y duermen. Para no aburrirse inventa juegos e imita a las tortugas mayores, hasta que un día sus ocurrencias despiertan a todos y les enseñan lo mucho que vale jugar."),
 "cuento-11-derecho-a-la-educacion": cuento(11, "Cuento 11: Derecho a la educación",
   "Ágata es una araña curiosa que se aburre tejiendo siempre la misma tela y experimenta con hilos y formas nuevas, aunque las arañas mayores la miren con recelo. Sus experimentos terminan cambiando la manera de aprender de todo el pastizal."),
 "cuento-10-derecho-a-la-atencion-especial-en-discapacidad": cuento(10, "Cuento 10: Derecho a la atención especial en discapacidad",
   "Enrique es un elefantito distinto: camina a su ritmo, se distrae con facilidad y le cuesta hablar. En la larga marcha hacia los depósitos de agua, toda la manada aprende a esperarlo, entenderlo y cuidarlo."),
 "cuento-9-derecho-a-la-salud": cuento(9, "Cuento 9: Derecho a la salud",
   "Anastasia, la más pequeña de unas muñecas rusas de madera, siente un dolor que nadie sabe explicar. Sus hermanas harán todo lo posible para que su dueño, distraído con su teléfono, se dé cuenta y la lleve a curar."),
 "cuento-8-derecho-a-que-se-respete-su-cultura": cuento(8, "Cuento 8: Derecho a que se respete su cultura",
   "Leonardo, un pulpo de aguas cálidas, llega a un colegio de la Antártida con su acento, sus colores y su baile. Sus compañeros se burlan de él hasta que un experimento en clase los pone en su lugar y descubren lo que cada cultura puede enseñar."),
 "cuento-7-derecho-a-acceder-a-la-informacion": cuento(7, "Cuento 7: Derecho a acceder a la información",
   "Silvia es una chimpancé pequeña y muy hábil que no deja de hacer preguntas sobre el mundo y sobre los humanos. Buscar respuestas la llevará a descubrir que no todo lo que cuentan los líderes de la tropa es cierto."),
 "cuento-6-derecho-a-expresarse": cuento(6, "Cuento 6: Derecho a expresarse",
   "En una jaula llena de pájaros de todas partes reina el caos. Martín, un diminuto zunzuncito, y los más pequeños encuentran la forma de hacerse oír, y su plan termina llevando a todos a la libertad."),
 "cuento-5-derecho-a-la-libertad": cuento(5, "Cuento 5: Derecho a la libertad",
   "Carlota, una canguro que acaba de salir de la bolsa de su madre, quiere explorar el mundo por su cuenta. Su mamá aprende a dejarla dar sus primeros saltos y a tomar sus propias decisiones."),
 "cuento-4-derecho-a-vivir-con-su-familia": cuento(4, "Cuento 4: Derecho a vivir con su familia",
   "Mateo es un cachorro que crece feliz con su mamá, su abuela y sus hermanos, hasta que la familia está a punto de separarse. Una historia sobre la importancia de crecer junto a los tuyos."),
 "cuento-3-derecho-a-un-nombre-y-a-una-nacionalidad": cuento(3, "Cuento 3: Derecho a un nombre y a una nacionalidad",
   "En una caja de juguetes cada uno guarda la historia del lugar donde nació. Solo Volqueta, un camión de madera, no recuerda de dónde viene, y sus compañeros la ayudan a recuperar su nombre y su origen."),
 "cuento-2-derecho-a-la-vida-la-supervivencia-y-el-desarrollo": cuento(2, "Cuento 2: Derecho a la vida, la supervivencia y el desarrollo",
   "A Carlos, un renacuajo, le están saliendo patas. Con su familia y toda la charca descubre qué es la metamorfosis y lo que significa crecer, hasta encontrar lo que de verdad quiere ser: cantante."),
 "cuento-1-derecho-a-ser-cuidados-defendidos-y-protegidos": cuento(1, "Cuento 1: Derecho a ser cuidados, defendidos y protegidos",
   "Hortensia crece en un jardín lleno de flores, rodeada de plantas mayores que la cuidan. Cuando aparece un peligro, el jardín entero aprende a organizarse para proteger a los más pequeños."),
 "el-frenetico-baile-de-chip": dict(autor=CEIBA_A, creditos=CEIBA_C, editorial="Maguaré · Ministerio de Culturas", edad="6-8"),
 "el-cumpleanos-de-rosalinda": dict(autor=CEIBA_A, creditos=CEIBA_C, editorial="Maguaré · Ministerio de Culturas", edad="6-8"),
 "la-memoria-del-abuelo": dict(titulo="La memoria del abuelo", autor=CEIBA_A, creditos=CEIBA_C, editorial="Maguaré · Ministerio de Culturas", edad="6-8"),
 "una-sopa-para-la-fiesta": dict(autor=CEIBA_A, creditos=CEIBA_C, editorial="Maguaré · Ministerio de Culturas", edad="6-8"),
 "el-libro-perdido-de-gigi": dict(autor=CEIBA_A, creditos=CEIBA_C, editorial="Maguaré · Ministerio de Culturas", edad="6-8"),
 "el-viaje-de-la-familia-cuy": dict(autor=CEIBA_A, creditos=CEIBA_C, editorial="Maguaré · Ministerio de Culturas", edad="6-8"),
 "los-arrullos-de-jaamo": dict(autor="Tradición oral (ed. Jesús Mario Girón Higuita)", editorial=ICBF, edad="0-5",
   creditos="Edición y adaptación de textos: Jesús Mario Girón Higuita - Recopilación: Claudia Rueda Gómez - Ilustración: Daniel A. Fajardo Bautista, Victoria Peters Rada"),
 "patas-de-armadillo-dientes-de-raton": dict(autor="Tradición oral (ed. Alberto Aljure)", editorial=ICBF, edad="0-5",
   creditos="Edición y adaptación de relatos: Alberto Aljure - Recopilación: María Fernanda Mantilla - Ilustración: Daniel A. Fajardo Bautista, Victoria Peters Rada"),
 "canciones-rondas-nanas-retahilas-y-adivinanzas": dict(autor="Tradición oral (sel. Iván Hernández)", editorial=LEMC, edad="0-5",
   creditos="Edición y selección: Iván Hernández - Ilustraciones: Silvana Giraldo",
   resumen="Una selección de canciones, rondas, nanas, retahílas y adivinanzas de la tradición oral para jugar con las palabras, cantarlas, trabar la lengua y destrabarla otra vez."),
 "por-que-el-elefante-tiene-la-trompa-asi": dict(editorial=LEMC, edad="6-8",
   resumen="Hubo un tiempo en que el elefante tenía la nariz corta, y un elefantito muy curioso no paraba de hacer preguntas. Uno de los célebres cuentos de «Así fue» de Rudyard Kipling, que vivió muchos años en la India y escribió sobre sus gentes y sus animales."),
 "la-bella-y-la-bestia": dict(editorial=LEMC, edad="6-8"),
 "fabulas": dict(autor="Félix María Samaniego", editorial=LEMC, edad="6-8", creditos="Félix María Samaniego - Ilustraciones: Daniela Gallego"),
 "menique": dict(editorial=LEMC, edad="6-8"),
 "el-patito-feo": dict(editorial=LEMC, edad="6-8"),
 "abrete-grano-pequeno": dict(titulo="Ábrete, grano pequeño", editorial=LEMC, edad="6-8"),
 "de-animales-y-de-ninos": dict(autor="María Eastman, Rafael Jaramillo, Gabriela Mercedes Arciniegas, Santiago Pérez, Rocío Vélez",
   creditos="María Eastman, Rafael Jaramillo Arango, Gabriela Mercedes Arciniegas, Santiago Pérez, Rocío Vélez de Piedrahíta", editorial=LEMC, edad="6-8"),
 "barbas-pelos-y-cenizas": dict(autor="Charles Perrault, Hermanos Grimm", creditos="Charles Perrault, Hermanos Grimm", editorial=LEMC, edad="6-8",
   resumen="Historias de fantasía para disfrutar con los niños: «Barba Azul» de Charles Perrault, y «Los tres pelos de oro del diablo» y «La Cenicienta» de los Hermanos Grimm."),
 "canta-palabras": dict(autor="Varios autores", editorial=LEMC, edad="6-8",
   creditos="Textos de varios autores de dominio público - Ilustraciones: José Rosero, Rafael Yockteng"),
 "un-castillo-de-libros": dict(autor="Susana Aristizábal", editorial="Tragaluz Editores · Ministerio de Cultura", edad="0-5",
   creditos="Autora: Susana Aristizábal - Ilustraciones: Nel Correa"),
 "tiki-tiki-tai-libro": dict(titulo="Tiki, tiki, tai", autor="Tradición oral rrom (ed. María Cristina Rincón)", editorial=ICBF, edad="0-5",
   creditos="Edición y adaptación: María Cristina Rincón - Recopilación y traducción al rromanés: Ana Dalila Gómez Baos - Ilustración: Victoria Peters Rada"),
 "puro-cuento": dict(editorial=LEMC, edad="6-8"),
 "de-viva-voz": dict(autor="Varios autores", editorial=LEMC, edad="6-8"),
 "con-pombo-y-platillos": dict(titulo="Con Pombo y platillos", editorial=LEMC, edad="6-8"),
 "el-rey-de-los-topos-y-su-hija": dict(editorial=LEMC, edad="6-8"),
 "bosque-adentro": dict(autor="Hermanos Grimm", creditos="Hermanos Grimm", editorial=LEMC, edad="6-8"),
 "una-morena-en-la-ronda": dict(autor="Tradición oral afrocolombiana (ed. María Cristina Rincón)", editorial=ICBF, edad="0-5",
   creditos="Edición y adaptación: María Cristina Rincón - Recopilación e investigación: Pilar Posada, Moraima Simarra Hernández y otros"),
 "putunkaa-serruma-duermete-pajarito": dict(titulo="Putunkaa serruma: duérmete, pajarito blanco", autor="Tradición oral indígena (ed. María Cristina Rincón)",
   editorial="ICBF · OIM · Fundalectura", edad="0-5",
   creditos="Edición y adaptación: María Cristina Rincón - Investigación y recopilación: Socorro Vásquez"),
 "tortuguita-veni-baila-libro": dict(titulo="Tortuguita, vení bailá", autor="Tradición oral indígena", editorial=ICBF, edad="0-5",
   creditos="Edición: Dipacho, María Fernanda Mantilla, Victoria Peters R., Marcela Tristancho - Ilustración: Daniel A. Fajardo Bautista, Victoria Peters Rada"),
}
DOBLE = {"los-arrullos-de-jaamo","patas-de-armadillo-dientes-de-raton","tiki-tiki-tai-libro","una-morena-en-la-ronda","putunkaa-serruma-duermete-pajarito","tortuguita-veni-baila-libro"}
