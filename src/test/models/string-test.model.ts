import { model, Schema } from 'mongoose';
import { EditTypes, MongooseModelAdmin } from '../../server';

const StringTestSchema = new Schema<{
  strField: string;
  strField2: string;
  strField3: string;
  textField: string;
}>({
  strField: {
    type: String,
    maxlength: 20,
    minlength: 3,
    name: '字符串strField',
    default: 'defaultValue',
    placeholder: '请输入xxx',
  },
  strField2: {
    type: String,
    required: true,
  },
  strField3: {
    filterType: new MongooseModelAdmin.FilterTypes.FilterStringSearchType({
      tip: '就是提示你一下',
    }),
  },
  textField: {
    type: String,
    name: '文本字段3',
    editType: new EditTypes.EditStringTextareaType({
      required: false,
      maxLength: 100,
      placeholder: '请输入XXX',
    }),
    filterType: new MongooseModelAdmin.FilterTypes.FilterStringSearchType({
      placeholder: '额额额',
    }),
  },
}, {
  timestamps: true,
});

const StringTestModel = model('string-test', StringTestSchema);
export default StringTestModel;
