import React from 'react';
import renderer from 'react-test-renderer';
import PlantCard from '../PlantCard';

describe('PlantCard', () => {
  let component;

  afterEach(() => {
    if (component) {
      renderer.act(() => {
        component.unmount();
      });
      component = null;
    }
  });

  it('sollte korrekt gerendert werden (Snapshot Test)', () => {
    renderer.act(() => {
      component = renderer.create(
        <PlantCard 
          name="Monstera Deliciosa" 
          wateringSchedule="Alle 3 Tage" 
        />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('sollte mit verschiedenen Props korrekt gerendert werden', () => {
    renderer.act(() => {
      component = renderer.create(
        <PlantCard 
          name="Aloe Vera" 
          wateringSchedule="Einmal pro Woche" 
        />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('sollte mit leerem wateringSchedule korrekt gerendert werden', () => {
    renderer.act(() => {
      component = renderer.create(
        <PlantCard 
          name="Kaktus" 
          wateringSchedule="" 
        />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
