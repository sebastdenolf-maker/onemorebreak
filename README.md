# OneMoreBreak™

OneMoreBreak™ is een speelse website die bezoekers uitnodigt om een pauze te nemen. Na een korte, humoristische kennismaking kunnen ze activiteiten kiezen om hun tijd te verspillen.

## Lokaal starten

Je hebt Python 3 en een moderne browser nodig. Er zijn geen pakketten om te installeren en er is geen buildstap.

Voer in de hoofdmap van dit project uit:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open daarna `http://127.0.0.1:8000` in je browser. Stop de server met `Ctrl+C`.

## Hoe de website werkt

De website draait volledig in de browser. De verschillende schermen staan in dezelfde HTML-pagina; JavaScript bepaalt welk scherm zichtbaar is. Er is geen database, accountserver of betaalfunctie.

De bezoeker doorloopt het welkomstscherm en de productiviteitsvraag. Het antwoord **YES** leidt naar een grappige afwijzing; **NO** leidt naar het activiteitenmenu.

| Activiteit | Gedrag |
| --- | --- |
| TYPING™ | Typ vijf keer `give me onemorebreak` en bevestig telkens met Enter om een beloning te ontgrendelen. |
| SWIPING™ | Swipe omhoog, sleep omhoog met de muis of gebruik de pijltjesknop. Na tien swipes volgt een beloning. |
| BLANK STARE™ | Wacht twintig seconden om een beloning te ontgrendelen. De timer loopt daarna verder. |
| CLICKING CONTEST™ | De eerste klik start een ronde van tien seconden. Vijftig klikken ontgrendelen een beloning. |
| DAYDREAMING™ | Na de lidmaatschapsaanvraag beschikbaar: herhalende video en audio, met een beloningslink vanaf dertig seconden video. |
| BOB ROSS™ | Na de lidmaatschapsaanvraag beschikbaar: video en berichten, met een beloningslink vanaf dertig seconden video. |

De lidmaatschapsaanvraag is onderdeel van de ervaring: iedereen wordt geaccepteerd en krijgt een willekeurig nummer van zes cijfers. De optionele naam verschijnt op het scherm; de keuzevakjes worden niet verwerkt.

## Opbouw van de code

De website is verdeeld over deze bestanden:

| Bestand of map | Inhoud |
| --- | --- |
| `index.html` | De schermen, teksten, knoppen en formulieren. |
| `assets/css/styles.css` | Kleuren, kaders, animaties en aanpassingen voor mobiele schermen. |
| `assets/js/navigation.js` | Hoofdschermen, productiviteitsvraag en lidmaatschapsaanvraag. |
| `assets/js/activities.js` | Openen en sluiten van activiteiten, typing, de pauzetimer en het ontgrendelen van ledenactiviteiten. |
| `assets/js/swiping.js`, `clicking.js` | De swipe- en klikactiviteiten. |
| `assets/js/activity-intro.js` | De introductieberichten voor openbare activiteiten. |
| `assets/js/daydreaming.js`, `bob-ross.js` | Starten en stoppen van de ledenvideo's en bijbehorende audio. |
| `assets/js/encouragement.js`, `daydream-reward.js` | Tussentijdse berichten en de Daydreaming-beloning. |
| `assets/js/enter.js`, `membership-init.js` | Bediening van de ENTER-knop en de beginstatus van ledenknoppen. |
| `assets/media/` | Twee MP4-video's en één MP3-audiobestand. |

De functie `go(n)` toont een hoofdscherm; de activiteiten gebruiken aparte schermen die over het menu verschijnen. De scripts worden op dezelfde plaatsen en in dezelfde volgorde geladen als in het oorspronkelijke prototype, zodat het bestaande gedrag behouden blijft.

De HTML bevat geen ingesloten media meer. Video en audio staan als gewone bestanden in `assets/media/`. De media gebruiken voorlopig nog `preload="auto"`; verdere optimalisatie van het laden is een aparte verbetering. Publiceer altijd de volledige projectmap, inclusief `assets/`.

## Bekende beperkingen

- De zes beloningslinks verwijzen naar `#`; muziekbestemmingen zijn nog niet ingesteld.
- Swiping toont tijdelijke teksten in plaats van foto's.
- Lidmaatschap en scores worden niet duurzaam opgeslagen. Na herladen begint de ervaring opnieuw.
- Lidnummers zijn willekeurig en niet gegarandeerd uniek. Lidmaatschap is geen beveiligd account.
- De Blank Stare-timer blijft doorlopen wanneer je de activiteit sluit.
- De terugknop van de browser volgt de interne schermwisselingen niet.
- De code bevat oudere, ongebruikte onderdelen en meerdere CSS-aanpassingen die elkaar overschrijven.

## Wijzigingen controleren

Er staat nog geen automatische testsuite in deze repository. Controleer voor een pull request minstens:

1. De route ENTER → OK → YES → opnieuw proberen → NO → activiteitenmenu.
2. De vier openbare activiteiten en hun beloningen.
3. De lidmaatschapsaanvraag en het ontgrendelen van de twee ledenactiviteiten.
4. Het afspelen en stoppen van video en audio.
5. Het sluiten, opnieuw openen en herladen van activiteiten.
6. De bediening en indeling op een klein mobiel scherm.
7. De browserconsole op onverwachte JavaScript-fouten.

De tijdelijke beloningslinks en het bestaande gedrag van timers zijn bekende beperkingen; vermeld ze apart van nieuwe fouten.

## Werken met GitHub

Gebruik voor iedere afgebakende wijziging een aparte branch, bijvoorbeeld `docs/project-guide` of `fix/membership-storage`.

1. Begin vanaf de actuele basisbranch, normaal `main`.
2. Maak een branch voor één onderwerp.
3. Sla samenhangende wijzigingen op in kleine commits met duidelijke beschrijvingen.
4. Open een pull request naar `main` en beschrijf wat verandert, waarom en hoe het is gecontroleerd.
5. Bekijk de verschillen en controleer de website voordat je samenvoegt.
6. Publiceer de gecontroleerde versie via je hosting. Samenvoegen en publiceren zijn aparte stappen, tenzij de hosting ze automatisch koppelt.

Een pull request voor documentatie kan bijvoorbeeld gevolgd worden door een aparte pull request die de code opsplitst zonder het gedrag te veranderen. Houd functionele verbeteringen daarna in eigen pull requests, zodat elke wijziging overzichtelijk blijft.
