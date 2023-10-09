import React from 'react';
import { Flex } from 'grid-styled';
import { Card, CardText, CardHeader } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';

// import CardHeader from 'components/CardHeader';

import Wrapper from './Wrapper';

function UpdatesPage() {
  return (
    <Wrapper>
      <Flex
        wrap
        is="section"
        px={['16px', '150px', '200px', '300px', '400px']}
        mt={['16px', '16px', '50px']}
      >
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.7.2"
            subtitle="09-10-2023"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Korrekturen</h3>
            <List>
              <ListItem disabled primaryText="0-Wert Einträge werden korrekt erkannt und können editiert werden" />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.7.1"
            subtitle="13-06-2022"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Erweiterungen</h3>
            <List>
              <ListItem disabled primaryText="Bei den Bemerkungen-Felder in der Sektion Leistungselemente wurden die Zahlen am Ende des Labels entfern" />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.7.0"
            subtitle="13-06-2022"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Erweiterungen</h3>
            <List>
              <ListItem disabled primaryText="Bei der Sektion Leistungselemente wurden drei neue Felder mit den Label Bemerkungen 2-4 hinzugefügt" />
              <ListItem disabled primaryText="Diese Felder erscheinen auch beim CSV-Export, falls die entsprechenden Export-Einstellungen gesetzt sind" />
              <ListItem disabled primaryText="Falls die Ordnung der Eingabefelder beim Reiter 'Zeit' durcheinander gerate ist, kann diese über die Sidebar-Einstellung 'Einstellungen zurücksetzen' zurückgesetzt werden" />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.6.1"
            subtitle="18-01-2022"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Korrekturen</h3>
            <List>
              <ListItem disabled primaryText="Saldo Zeitverlauf-Graph zeigt jetzt auch den letzten Eintrag des Jahres an" />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.6.0"
            subtitle="17-01-2022"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Korrekturen</h3>
            <List>
              <ListItem disabled primaryText="Feiertage welche auf ein Wochenende fallen, werden neu nicht mehr in die Zeitrechnung einbezogen" />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.5.8"
            subtitle="12-03-2020"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Neuerungen</h3>
            <List>
              <ListItem disabled primaryText="Beim CSV-Export können die Bemerkungen neu optional hinzugefügt werden" />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.5.7"
            subtitle="06-03-2020"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Neuerungen</h3>
            <List>
              <ListItem disabled primaryText="Über https://timetracker.cloud.zebbra.ch/clear kann der Applikations-Status zurückgesetzt werden" />
              <ListItem disabled primaryText="Der Reports-Export-CSV Export wurde dem Elemente-Report angeglichen" />
            </List>
            <h3>Korrekturen</h3>
            <List>
              <ListItem disabled primaryText="Beim Elemente-Report wurden die Ist-Zeiten der Tabelle Jahresarbeitszeit Effektiv im Falle von Tag-basierten Werten korrigiert" />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.5.6"
            subtitle="26-02-2020"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Neuerungen</h3>
            <List>
              <ListItem disabled primaryText="Administratoren können neu Benutzer verwalten" />
            </List>
            <h3>Korrekturen</h3>
            <List>
              <ListItem disabled primaryText="Der PDF Export wurde korrigiert." />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.5.5"
            subtitle="26-02-2020"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Neuerungen</h3>
            <List>
              <ListItem disabled primaryText="Reportings und Einstellungen können neu auch als CSV-Datei heruntergeladen werden" />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.5.4"
            subtitle="26-02-2020"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Korrekturen</h3>
            <List>
              <ListItem disabled primaryText="Der PDF Export wurde verbessert." />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.5.3"
            subtitle="21-02-2020"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Neuerungen</h3>
            <List>
              <ListItem disabled primaryText="Beim Leistungsreporting werden neu die Soll- und die Ist-Werte ausgewertet" />
            </List>
            <h3>Korrekturen</h3>
            <List>
              <ListItem disabled primaryText="Der PDF Export wurde verbessert. Die Schriftgrösse wurde vergrössert und das Reporting auf mehrere Seiten aufgeteilt." />
            </List>
          </CardText>
        </Card>
        <Card className="cardWrapper">
          <CardHeader
            title="Version 2.5.2"
            subtitle="10-02-2020"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Neuerungen</h3>
            <List>
              <ListItem disabled primaryText="Neue Seite mit Informationen über Updates wurde hinzugefügt." />
              <ListItem disabled primaryText="Benutzer können neu die Kalender-Einstellungen über ein Toggle zurücksetzen lassen." />
            </List>
            <h3>Korrekturen</h3>
            <List>
              <ListItem disabled primaryText="Fehlerbehebung beim Aktualisierungsvorgang für IE10." />
            </List>
          </CardText>
        </Card>
        <Card>
          <CardHeader
            title="Version 2.5.1"
            subtitle="07-02-2020"
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <h3>Neuerungen</h3>
            <List>
              <ListItem disabled primaryText="Benutzer werden neu darüber informiert, dass es Änderungen gibt und die Applikation neu geladen werden muss." />
            </List>
            <h3>Korrekturen</h3>
            <List>
              <ListItem disabled primaryText="Das Session-Management wurde überarbeitet und es sollte zu weniger Neuanmeldungen kommen." />
            </List>
          </CardText>
        </Card>
      </Flex>
    </Wrapper>
  );
}

export default UpdatesPage;
