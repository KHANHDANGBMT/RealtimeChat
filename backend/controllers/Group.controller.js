const mongoose = require("mongoose");
const GroupSchema = require("../models/Group.model");

exports.saveGroup = function saveGroup(group) {
  console.log(group, "group receive from server");
  const groupInstance = new GroupSchema({
    _id: mongoose.Types.ObjectId(),
    groupName: group.groupName,
    memberList: group.memberList,
    usernameCreateGroup: group.usernameCreateGroup,
  });
  return groupInstance
    .save()
    .then(newGroup => {
      return newGroup;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
};

exports.fetchGroupList = async function fetchGroupList(username) {
  let groupList = await GroupSchema.find();
  let groupResponse = [];
  groupList.forEach((group, index) => {
    if (group.memberList.indexOf(username) > -1) {
      groupResponse.push(group);
    }
  });
  return groupResponse;
};

exports.addUser = async function addUser(usernameJoin, groupId) {
  let groupList = await GroupSchema.find({ _id: groupId });
  if (
    groupList.length &&
    groupList[0].memberList?.indexOf(usernameJoin) === -1
  ) {
    groupList[0].memberList.push(usernameJoin);
    await groupList[0].save();
    return groupList[0];
  }
  return false;
};

exports.userOfList = async function userOfList(groupName) {
  let userOfList = await GroupSchema.find({ groupName: groupName });
  return userOfList[0].memberList;
};
