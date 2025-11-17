import React from 'react';
import renderer from 'react-test-renderer';
import PlantCard from '../PlantCard';

describe('PlantCard', () => {
  let component;

  const mockPlant = {
    id: '1',
    name: 'Monstera Deliciosa',
    imageUri: 'https://example.com/plant.jpg',
  };

  const mockOnPress = jest.fn();

  afterEach(() => {
    if (component) {
      renderer.act(() => {
        component.unmount();
      });
      component = null;
    }
    mockOnPress.mockClear();
  });

  it('sollte korrekt gerendert werden (Snapshot Test)', () => {
    renderer.act(() => {
      component = renderer.create(
        <PlantCard 
          plant={mockPlant}
          width={200}
          height={280}
          onPress={mockOnPress}
        />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('sollte mit überfälliger Aufgabe korrekt gerendert werden', () => {
    renderer.act(() => {
      component = renderer.create(
        <PlantCard 
          plant={{ ...mockPlant, name: 'Aloe Vera' }}
          width={200}
          height={280}
          hasOverdueTask={true}
          onPress={mockOnPress}
        />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('sollte mit heutiger Aufgabe korrekt gerendert werden', () => {
    renderer.act(() => {
      component = renderer.create(
        <PlantCard 
          plant={{ ...mockPlant, name: 'Kaktus', imageUri: null }}
          width={200}
          height={280}
          hasTodayTask={true}
          onPress={mockOnPress}
        />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
