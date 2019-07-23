import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { Droppable, Draggable } from "react-beautiful-dnd";
import LaneCustomListsEditor from "../LaneCustomListsEditor";

describe("LaneCustomListsEditor", () => {
  let wrapper;
  let onUpdate;

  let allCustomListsData = [
    { id: 1, name: "list 1", entry_count: 0 },
    { id: 2, name: "list 2", entry_count: 2 },
    { id: 3, name: "list 3", entry_count: 0 }
  ];

  beforeEach(() => {
    onUpdate = stub();
  });

  it("renders available lists", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        />
    );
    let container = wrapper.find(".available-lists");
    expect(container.length).to.equal(1);

    let droppable = container.find(Droppable);
    expect(droppable.length).to.equal(1);

    let lists = droppable.find(Draggable);
    expect(lists.length).to.equal(3);

    expect(lists.at(0).text()).to.contain("list 1");
    expect(lists.at(0).text()).to.contain("Items in list: 0");
    expect(lists.at(1).text()).to.contain("list 2");
    expect(lists.at(1).text()).to.contain("Items in list: 2");
    expect(lists.at(2).text()).to.contain("list 3");
    expect(lists.at(2).text()).to.contain("Items in list: 0");

    wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1, 3]}
        />
    );

    container = wrapper.find(".available-lists");
    expect(container.length).to.equal(1);

    droppable = container.find(Droppable);
    expect(droppable.length).to.equal(1);

    lists = droppable.find(Draggable);
    expect(lists.length).to.equal(1);

    expect(lists.at(0).text()).to.contain("list 2");
    expect(lists.at(0).text()).to.contain("Items in list: 2");
  });

  it("renders current lists", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        />
    );
    let container = wrapper.find(".current-lists");
    expect(container.length).to.equal(1);

    let droppable = container.find(Droppable);
    expect(droppable.length).to.equal(1);

    let lists = droppable.find(Draggable);
    expect(lists.length).to.equal(0);

    wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[2, 3]}
        />
    );

    container = wrapper.find(".current-lists");
    expect(container.length).to.equal(1);

    droppable = container.find(Droppable);
    expect(droppable.length).to.equal(1);

    lists = droppable.find(Draggable);
    expect(lists.length).to.equal(2);

    expect(lists.at(0).text()).to.contain("list 2");
    expect(lists.at(0).text()).to.contain("Items in list: 2");
    expect(lists.at(1).text()).to.contain("list 3");
    expect(lists.at(1).text()).to.contain("Items in list: 0");
  });

  it("prevents dragging within available lists", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        />
    );

    // simulate starting a drag from available lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 1,
      source: {
        droppableId: "available-lists"
      }
    });

    let container = wrapper.find(".available-lists");
    let droppable = container.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(true);
  });

  it("prevents dragging within current lists", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1, 2]}
        />
    );

    // simulate starting a drag from current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 1,
      source: {
        droppableId: "current-lists"
      }
    });

    let container = wrapper.find(".current-lists");
    let droppable = container.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(true);
  });

  it("drags from available lists to current lists", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1]}
        onUpdate={onUpdate}
        />
    );

    // simulate starting a drag from available lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 2,
      source: {
        droppableId: "available-lists"
      }
    });
    wrapper.update();

    let currentContainer = wrapper.find(".current-lists");
    let droppable = currentContainer.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(false);

    // simulate dropping on the current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 2,
      source: {
        droppableId: "available-lists"
      },
      destination: {
        droppableId: "current-lists"
      }
    });
    wrapper.update();

    currentContainer = wrapper.find(".current-lists");
    droppable = currentContainer.find(Droppable);
    // The dropped item has been added to the current lists.
    let lists = droppable.find(Draggable);
    expect(lists.length).to.equal(2);
    expect(lists.at(0).text()).to.contain("list 1");
    expect(lists.at(1).text()).to.contain("list 2");
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.deep.equal([1, 2]);
  });

  it("shows message in place of available lists when dragging from current lists", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1]}
        />
    );

    // simulate starting a drag from current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 1,
      source: {
        droppableId: "current-lists"
      }
    });
    wrapper.update();

    let availableContainer = wrapper.find(".available-lists");
    let droppable = availableContainer.find(Droppable);
    let message = droppable.find("p");
    expect(droppable.prop("isDropDisabled")).to.equal(false);
    expect(message.length).to.equal(1);
    expect(message.text()).to.contain("here to remove");

    // if you drop anywhere on the page, the mssage goes away.
    // simulate dropping outside a droppable (no destination)
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 1,
      source: {
        droppableId: "current-lists"
      }
    });
    wrapper.update();

    availableContainer = wrapper.find(".available-lists");
    droppable = availableContainer.find(Droppable);
    message = droppable.find("p");
    expect(droppable.prop("isDropDisabled")).to.equal(true);
    expect(message.length).to.equal(0);
  });

  it("drags from current lists to available lists", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1, 2]}
        onUpdate={onUpdate}
        />
    );

    // simulate starting a drag from current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragStart({
      draggableId: 1,
      source: {
        droppableId: "current-lists"
      }
    });
    wrapper.update();

    let availableContainer = wrapper.find(".available-lists");
    let droppable = availableContainer.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(false);

    // simulate dropping on the available lists
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 1,
      source: {
        droppableId: "current-lists"
      },
      destination: {
        droppableId: "available-lists"
      }
    });
    wrapper.update();
    wrapper.setProps({ customListIds: onUpdate.args[0][0] });

    // the dropped item has been removed from the current lists
    let currentContainer = wrapper.find(".current-lists");
    droppable = currentContainer.find(Droppable);
    let lists = droppable.find(Draggable);

    expect(lists.length).to.equal(1);
    expect(lists.at(0).text()).to.contain("list 2");
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.deep.equal([2]);
  });

  it("adds a list to the lane", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[2]}
        onUpdate={onUpdate}
        />
    );

    let addLink = wrapper.find(".available-lists .links button");
    addLink.at(0).simulate("click");

    // the item has been added to the current lists
    let currentContainer = wrapper.find(".current-lists");
    let droppable = currentContainer.find(Droppable);
    let lists = droppable.find(Draggable);
    expect(lists.length).to.equal(2);
    expect(lists.at(0).text()).to.contain("list 1");
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.contain(1);
    expect(onUpdate.args[0][0]).to.contain(2);
  });

  it("removes a list from the lane", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1, 2]}
        onUpdate={onUpdate}
        />
    );

    let deleteLink = wrapper.find(".current-lists .links button");
    deleteLink.at(0).simulate("click");
    wrapper.setProps({customListIds: onUpdate.args[0][0]});
    // this list has been removed from the current lists
    let currentContainer = wrapper.find(".current-lists");
    let droppable = currentContainer.find(Droppable);
    let lists = droppable.find(Draggable);
    expect(lists.length).to.equal(1);
    expect(lists.at(0).text()).to.contain("list 2");
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.deep.equal([2]);
  });

  it("resets", () => {
    let wrapper = mount(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1]}
        onUpdate={onUpdate}
        />
    );

    // simulate dropping a list on the current lists
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 2,
      source: {
        droppableId: "available-lists"
      },
      destination: {
        droppableId: "current-lists"
      }
    });

    // Set customListIds to the new array of list IDs for this lane ([1, 2]), which got passed to
    // onUpdate when we added list 2 to the current lists
    wrapper.setProps({customListIds: onUpdate.args[0][0]});
    expect((wrapper.instance() as LaneCustomListsEditor).getCustomListIds().length).to.equal(2);
    expect(onUpdate.callCount).to.equal(1);
    (wrapper.instance() as LaneCustomListsEditor).reset([1]);
    // Calling reset passes the original array of list IDs ([1]) to onUpdate
    wrapper.setProps({customListIds: onUpdate.args[1][0]});
    expect((wrapper.instance() as LaneCustomListsEditor).getCustomListIds().length).to.equal(1);
    expect(onUpdate.callCount).to.equal(2);

    // simulate dropping a list on the available lists
    (wrapper.instance() as LaneCustomListsEditor).onDragEnd({
      draggableId: 1,
      source: {
        droppableId: "current-lists"
      },
      destination: {
        droppableId: "available-lists"
      }
    });

    // Set customListIds to the new array of list IDs for this lane ([]), which got passed to
    // onUpdate when we removed list 1 from the current lists
    wrapper.setProps({customListIds: onUpdate.args[2][0]});
    expect((wrapper.instance() as LaneCustomListsEditor).getCustomListIds().length).to.equal(0);
    expect(onUpdate.callCount).to.equal(3);
    (wrapper.instance() as LaneCustomListsEditor).reset([1]);
    // Calling reset passes the original array of list IDs ([1]) to onUpdate
    wrapper.setProps({customListIds: onUpdate.args[3][0]});
    expect((wrapper.instance() as LaneCustomListsEditor).getCustomListIds().length).to.equal(1);
    expect(onUpdate.callCount).to.equal(4);
  });
});
