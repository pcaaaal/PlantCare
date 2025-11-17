import React from 'react';
import renderer from 'react-test-renderer';
import PlantCard from '../PlantCard';

describe('PlantCard', () => {
  it('sollte korrekt gerendert werden (Snapshot Test)', () => {
    const tree = renderer
      .create(
        <PlantCard 
          name="Monstera Deliciosa" 
          wateringSchedule="Alle 3 Tage" 
        />
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('sollte mit verschiedenen Props korrekt gerendert werden', () => {
    const tree = renderer
      .create(
        <PlantCard 
          name="Aloe Vera" 
          wateringSchedule="Einmal pro Woche" 
        />
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('sollte mit leerem wateringSchedule korrekt gerendert werden', () => {
    const tree = renderer
      .create(
        <PlantCard 
          name="Kaktus" 
          wateringSchedule="" 
        />
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot();
  });
});
