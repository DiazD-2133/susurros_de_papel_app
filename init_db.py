import os
from app import create_app
from models import db, Work, User

app = create_app()

with app.app_context():
    db.create_all()

    # Admin por defecto si no existe
    if User.query.count() == 0:
        admin_user = User(username='admin')
        # Cambia la contraseña deseada aquí o en las variables de entorno
        admin_user.set_password('avion21.')
        db.session.add(admin_user)
        print("Usuario administrador creado: 'admin' / contraseña: 'avion21.'")

    if Work.query.count() == 0:
        sample_works = [
            Work(
                title='El Relojero de los Minutos Perdidos',
                type='cuento',
                category_label='Cuentos Cortos',
                subtitle='Un relato sobre el tiempo que dejamos ir',
                read_time='4 min',
                likes=42,
                featured=True,
                excerpt='Don Mateo no arreglaba péndulos ni engranajes de plata; él restauraba los segundos que la gente perdía discutiendo en las esquinas...',
                content="""Don Mateo tenía un taller pequeño al final del callejón del Laurel. En el letrero no se leía "Relojería", sino "Recuperación". Nadie sabía a ciencia cierta cómo lo hacía, pero la gente del pueblo acudía a él cuando sentía que el día se le había escapado entre los dedos.

—Verá usted, Don Mateo —dijo una tarde una anciana con voz cansada—, pasé diez años enojada con mi hermana y ayer se marchó para siempre. Siento que me faltaron horas para decirle que la quería.

El viejo relojero sonrió con dulzura, ajustó su lupa sobre el ojo derecho y abrió un cajón de caoba repleto de pequeños frascos de cristal.

—El tiempo no se destruye, señora María, solo se traspasa. 

Extrajo con unas pinzas un fino hilo de luz dorada de uno de los frascos y lo colocó dentro de un reloj de bolsillo descompuesto. Al darle cuerda, un aroma a jazmines y tardes de infancia inundó la estancia. 

Aquella noche, la señora María soñó con su hermana durante ocho horas consecutivas que parecieron toda una vida en paz. Don Mateo volvió a cerrar el taller, sabiendo que el verdadero valor del tiempo no es medirlo, sino atreverse a sentirlo antes de que se vuelva sombra."""
            ),
            Work(
                title='Nocturno en la Ventana',
                type='poema',
                category_label='Poesía',
                subtitle='Versos a la lluvia tibia',
                read_time='2 min',
                likes=89,
                featured=True,
                excerpt='La noche dibuja en el cristal silencios que la luz del farol traduce en versos grises...',
                content="""La noche dibuja en el cristal
silencios que la luz del farol traduce en sombra.
Hay un rumor de hojas olvidadas
recorriendo las calles sin prisas.

Te pienso aquí,
donde el café se enfría lentamente
y la taza guarda el cerco de tus labios.

No hay prisa en la tormenta,
solo este deseo antiguo de nombrarte
antes de que la madrugada
desdibuje las sombras de la habitación.

Un verso es apenas eso:
un puente de papel
sobre un río que no existe."""
            ),
            Work(
                title='Elogio a la Lentitud',
                type='reflexion',
                category_label='Reflexiones',
                subtitle='Sobre el arte de contemplar',
                read_time='3 min',
                likes=31,
                featured=False,
                excerpt='Hemos olvidado cómo mirar el crecimiento de las plantas y el discurrir de las nubes en una tarde de domingo...',
                content="""Vivimos en una época que rinde culto a la prisa. Queremos libros condensados, comidas instantáneas y afectos que se confirmen con un toque en la pantalla. Sin embargo, todo lo verdaderamente valioso en esta vida requiere tiempo para madurar.

El buen pan necesita fermentar en silencio. La amistad genuina se forja tras años de escuchas y ausencias compartidas. Un poema no nace del apuro, sino de la paciencia de quien sabe esperar a que la palabra adecuada se posicione en la página.

Hoy me propongo el lujo de la lentitud: mirar por la ventana sin buscar nada en concreto, dejar que la mente vague sin rumbo y escuchar el crujido del papel bajo los dedos. En este espacio, te invito a hacer lo mismo. No hay prisa por terminar de leer."""
            ),
            Work(
                title='El Faro del Viento',
                type='cuento',
                category_label='Cuentos Cortos',
                subtitle='Fantasía en la costa norte',
                read_time='5 min',
                likes=56,
                featured=False,
                excerpt='En la isla de Albatros no había mar, sino un océano de nubes densas que los navegantes surcaban en barcos de vela de seda...',
                content="""En la cima del acantilado de piedra negra, el Faro del Viento no emitía luz, sino melodías. El viejo farero, Samuel, tocaba un enorme órgano cuyos tubos se extendían hacia el cielo abierto.

Cuando la niebla bajaba demasiado y las naves del aire corrían peligro de encallar en los picos rocosos, Samuel presionaba las teclas de roble. Las notas no solo se escuchaban: se podían ver como ráfagas de colores que abrían surcos en la bruma.

Un Do mayor despejaba el norte; un Sol menor ahuyentaba las tormentas de viento eléctrico. Pero una noche de invierno, las manos de Samuel se entumecieron por el frío en mitad de una gran borrasca..."""
            ),
            Work(
                title='Geometría del Olvido',
                type='poema',
                category_label='Poesía',
                subtitle='Elegía en cuatro estrofas',
                read_time='1 min',
                likes=112,
                featured=True,
                excerpt='Borrar tu nombre es trazar una línea recta que jamás regresa a su origen...',
                content="""Borrar tu nombre
es trazar una línea recta
que jamás regresa a su origen.

Trazar un círculo perfecto
donde antes habitaba la casa,
el patio, el perro y tu voz.

La memoria es un ángulo agudo
que me clava su punta
cada vez que intento girar la esquina.

Y el olvido... el olvido es solo aire,
un espacio sin bordes
donde ya no duele caer."""
            ),
            Work(
                title='La Llave de Latón',
                type='cuento',
                category_label='Cuentos Cortos',
                subtitle='Misterio de desván',
                read_time='4 min',
                likes=67,
                featured=False,
                excerpt='Entre las pertenencias del abuelo encontré una llave sin cerradura y un mapa sin nombres...',
                content="""La llave no abría ningún cajón de la casa, ni la puerta del sótano, ni el viejo baúl de cuero. Era una pieza de latón pesado, desgastada en los dientes y con las iniciales *E.V.* grabadas en el ojo.

Pasé semanas probándola en cuanta cerradura antigua encontraba en los mercados de pulgas. Hasta que un domingo de lluvia, descubrí que la llave no abría una puerta de madera, sino la caja de música que mi abuela guardaba bajo su cama.

Al girar la llave, la música que sonó no era una melodía conocida, sino una grabación en alambre de la voz de mi abuelo leyendo un poema de amor que le escribió antes de la guerra."""
            )
        ]
        db.session.add_all(sample_works)
        print("Cuentos y poemas de ejemplo añadidos a la base de datos.")

    db.session.commit()
    print("Base de datos inicializada correctamente.")
