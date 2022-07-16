const Category = (Sequilize, DataTypes) => {
  const Category = Sequilize.define('Category', {
    id: {
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: DataTypes.STRING,
  });

  return Category;
};

module.exports = Category