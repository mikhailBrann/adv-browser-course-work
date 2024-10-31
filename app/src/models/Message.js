import { DataTypes } from 'sequelize';

const Message = (sequelize) => {
    return sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'text',
            validate: {
                isIn: [['text', 'file', 'audio', 'video', 'image', 'link']]
            }
        },
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
};

export default Message;